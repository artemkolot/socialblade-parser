import { FullParseResult, ParseResult } from "../model";

export const PARSE_KEYS = {
  MONTHLY_GAINED_VIEWS: {
    name: "viewers",
    trigger: "Monthly Gained Video Views",
  },
  MONTHLY_GAINED_SUBSCRIBERS: {
    name: "subscribers",
    trigger: "Monthly Gained Subscribers",
  },
};

type ActvieParseFunctions = {
  viewers: boolean;
  subscribers: boolean;
  info: boolean;
};

const initialActiveState: ActvieParseFunctions = {
  viewers: true,
  subscribers: true,
  info: true,
};

export class SocialBlade {
  private parseFunctions = {
    viewers: this.HighchartsParseFunction(
      PARSE_KEYS.MONTHLY_GAINED_VIEWS.trigger,
      PARSE_KEYS.MONTHLY_GAINED_VIEWS.name
    ),
    subscribers: this.HighchartsParseFunction(
      PARSE_KEYS.MONTHLY_GAINED_SUBSCRIBERS.trigger,
      PARSE_KEYS.MONTHLY_GAINED_SUBSCRIBERS.name
    ),
    info: this.parseChannelInfo(),
  };

  private activeParseFunctions = {
    viewers: true,
    subscribers: true,
    info: true,
  };

  private parseResult: FullParseResult = {};

  construtor(initialState: Partial<ActvieParseFunctions> = initialActiveState) {
    this.activeParseFunctions = {
      ...this.activeParseFunctions,
      ...initialState,
    };
  }

  public getParseFunctions() {
    return Object.entries(this.activeParseFunctions)
      .filter(([_, isActive]) => {
        return isActive;
      })
      .map(([parserKey]) => {
        return this.parseFunctions[
          parserKey as keyof typeof this.parseFunctions
        ];
      });
  }

  public getParseURL(channelNameOrId: string) {
    return `https://socialblade.com/youtube/channel/${channelNameOrId}`;
  }

  public setResult(result: { [channel: string]: ParseResult }) {
    Object.assign(this.parseResult, result);
  }

  public getResult() {
    return this.parseResult;
  }

  private HighchartsParseFunction(parseKey: string, name: string) {
    return `(() => {
        try {
            const charts = Highcharts.charts;
            const chart = charts
            .find((chart) => {
                const title = chart.userOptions.title.text;
                return title.startsWith("${parseKey}");
            });
            
            const result = chart.userOptions.series[0].data;
            if(result.length > 0) {
                resolve({
                    name: "${name}",
                    value: result.reverse(),
                });
            } else {
                reject({
                    name: "${name}",
                    error: '${parseKey} - no chart data'
                });
            }
        } catch (err) {
            reject({
                name: "${name}",
                error: err
            })
        }
      })()`;
  }

  private parseChannelInfo() {
    return `(() => {
        const parentElement = document.getElementById('YouTubeUserTopInfoBlock');
        if(!parentElement) {
            reject({
                name: 'info',
                error: Error('Can not get header with info in page')
            });
        }
        function getElementByXpath(path) {
          return document.evaluate(
            path,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          ).singleNodeValue;
        }
  
        const dataElements = {
          uploads: "youtube-stats-header-uploads",
          subscribers: "youtube-stats-header-subs",
          views: "youtube-stats-header-views",
          country: "youtube-user-page-country",
          type: "youtube-stats-header-channeltype",
        };
  
        const parseData = Object.entries(dataElements).map(([key, id]) => {
          return [key, document.getElementById(id)?.innerText];
        });
        const channel_id = document.getElementById('fav-bubble')?.getAttribute('class');
        
        const channel_name = getElementByXpath("//div[@id='YouTubeUserTopInfoBlockTop']//h4[1]/a"); 
        const user_created = getElementByXpath("//div[@id='YouTubeUserTopInfoBlock']//div[contains(@class, 'YouTubeUserTopInfo')]/span[contains(., 'User Created')]/parent::div/span[2]");
        const info = Object.fromEntries(parseData);
        
        Object.assign(info, {created: user_created?.textContent, id: channel_id, channel_name: channel_name?.textContent})
  
        if (info) {
          resolve({
            name: 'info',
            value: info
          });
        } else {
          reject({
            name: 'info',
            error: 'No info'
          });
        }
      })()`;
  }
}
