import { Context, segment } from 'koishi'

export const name = 'game-tracker'

const apiEndpointPrefix = 'https://api.gametools.network/bf2042/stats';

export function apply(ctx: Context) {
  async function fetchTrackerData(id: string) {
    return await ctx.http.get(`${apiEndpointPrefix}/?raw=false&format_values=true&platform=pc&skip_battlelog=false&name=${id}`);
  };

  ctx.command('bf2042 <id:text>', '查询Battlefield 2042战绩数据')
    .action(async ({session}, id) => {
      try {
        if (!id) return '请提供玩家ID!'
        // 鉴于大多数都是PC玩家，这里暂时默认查询origin平台
        const result = await fetchTrackerData(id);
        const {
          userName,
          kills,
          deaths,
          winPercent,
          killDeath,
          killAssists,
          bestClass
        } = result;
        await session.sendQueued(`玩家ID: ${userName}\n总击杀: ${kills}\n死亡次数: ${deaths}\n胜率: ${winPercent}\nKD: ${killDeath}\n助攻: ${killAssists}\n`);
      } catch(err) {
        console.log(err);
        return `发生错误! ${err}`;
      }
    });
}
