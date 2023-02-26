import { Context, Schema, segment } from 'koishi'

export const name = 'game-tracker'

export const Config = Schema.object({
  description: Schema.string().default('这里不用填写东西').description('给群友做的查询战地2042战绩数据的插件')
})

const apiEndpointPrefix = 'https://api.gametools.network/bf2042/stats';

const vehiclesMapping = {
  'MD540 Nightbird': ['小鸟', '夜莺'],
  'F-35E Panther': ['f35', '黑豹'],
  'M5C Bolte': ['博尔特'],
  'AH-64GX Apache Warchief': ['阿帕奇'],
  'MV-38 Condor': ['鱼鹰'],
  'EBAA Wildcat': ['小野猫'],
  'M1A5': ['美军主坦'],
  'RAH-68 Huron': ['休伦'],
  'LATV4 Recon': ['小车', '侦察车', '30小车'],
  'LCAA Hovercraft': ['气垫船', '泥头船'],
  'EBLC-Ram': ['拉姆车', '螃蟹车'],
  'MAV': ['运兵车', 'mav'],
  'EMKV90-TOR': ['电坦'],
  'SU-57 FELON': ['su57', '苏57'],
  'Mi-240 Super Hind': ['雌鹿', '运直'],
  'YG-99 Hannibal': ['汉尼拔'],
  'KA-520 Super Hokum': ['卡520'],
  'T28': ['t28', '俄军主坦']
};

export function apply(ctx: Context) {
  async function fetchTrackerData(id: string) {
    return await ctx.http.get(`${apiEndpointPrefix}/?raw=false&format_values=true&platform=pc&skip_battlelog=false&name=${id}`);
  };

  const cmd = ctx.command('bf2042', '战地2042战绩数据查询').usage('请注意格式，如果需要查询特定载具，请确保玩家ID和载具名称正确，如中间包含空格或者以特殊符号开头的请用英文引号包裹起来').example('bf2042.general -u 玩家id -v "EBAA Wildcat"')

  cmd.subcommand('.general', '-u 必需, -v 可选')
    .option('id', '-u <name:string>')
    .option('vehicle', '-v <vehicle:string>')
    .action(async ({ session, options }) => {
      const { id, vehicle } = options;
      try {
        if (!id) return '请提供玩家ID!'

        const result = await fetchTrackerData(id);
        const {
          userName,
          kills,
          deaths,
          winPercent,
          killDeath,
          killAssists,
          bestClass,
          vehiclesDestroyed,
          revives,
          killsPerMinute,
          repairs,
          enemiesSpotted
        } = result;
        if (vehicle) {
          const { vehicles } = result;
          const matchedVehicle = vehicles.find(item => item.vehicleName === String(vehicle))
          if (matchedVehicle) {
            const {
            vehicleName,
            kills,
            killsPerMinute,
            damage,
            passengerAssists,
            driverAssists,
            spawns
          } = matchedVehicle;
            await session.sendQueued(
              `载具名称: ${vehicleName}\n击杀: ${kills}\nKPM: ${killsPerMinute}\n造成伤害: ${damage}\n复活: ${spawns}\n乘客助攻: ${passengerAssists}\n驾驶员助攻: ${driverAssists}`
            );
          } else {
            return '未查询到该载具，请检查你的拼写是否正确'
          }
        } else {
          await session.sendQueued(`玩家ID: ${userName}\n击杀: ${kills}\nKPM: ${killsPerMinute}\n死亡: ${deaths}\n胜率: ${winPercent}\nKD: ${killDeath}\n助攻: ${killAssists}\n急救: ${revives}\n修复载具: ${repairs}\n摧毁载具: ${vehiclesDestroyed}\n索敌: ${enemiesSpotted}\n擅长专家: ${bestClass}`);
        }
      } catch (err) {
        console.log(err);
        return `发生错误! ${err}`;
      }
    });
  
  cmd.subcommand('.examples', '载具名称示例, 用来直接复制粘贴')
    .action(async ({ session }) => {
      return `[空载]\n小鸟: MD540 Nightbird\nf35: F-35E Panther\nsu57: SU-57 FELON\n雌鹿: Mi-240 Super Hind\n鱼鹰: MV-38 Condor\n阿帕奇: AH-64GX Apache Warchief\n卡520: KA-520 Super Hokum\n汉尼拔: YG-99 Hannibal\n休伦/肖肖尼: RAH-68 Huron\n===================\n[地载]\nT28: T28\nM1A5: M1A5\n电坦: EMKV90-TOR\n螃蟹车: EBLC-Ram\n运兵车: MAV\n气垫船: LCAA Hovercraft\n侦察车: LATV4 Recon\n小野猫: EBAA Wildcat\n博尔特: M5C Bolte\n`;
    });
}
