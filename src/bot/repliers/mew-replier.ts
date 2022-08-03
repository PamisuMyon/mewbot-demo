import { MessageCreateData, Node } from "mewbot";
import { IBot } from "../ibot.js";
import { ISubReplier, PrimaryReplier, ReplyAction, ReplyResult, SubReplyTestResult } from "./ireplier.js";

export class MewReplier extends PrimaryReplier {
    override type = 'mew';

    protected override _subRepliers = [
        new NodeInfoSubReplier(),
    ];

}

class NodeInfoSubReplier implements ISubReplier {

    protected _regex = /(查询)?据点(信息)? *　*(.*)/;

    async test(msg: MessageCreateData): Promise<SubReplyTestResult> {
        const r = this._regex.exec(msg.content as string);
        if (r) {
            return { confidence: 1, data: r[3] };
        }
        return { confidence: 0 };
    }

    async reply(bot: IBot, msg: MessageCreateData, data?: any): Promise<ReplyResult> {
        if (!data) {
            await bot.replyText(msg, '指令输入错误，需要指定据点ID');
            return { action: ReplyAction.Replied };
        }
        const info = await bot.client.getNodeInfo(data as string);
        if (info.data) {
            await bot.replyText(msg, this.beautifyNodeInfo(info.data));
        } else {
            // if (info.error?.name) // TODO 从错误信息中判断据点是否存在
            await bot.replyText(msg, '获取据点信息失败😭');
        }
        return { action: ReplyAction.Replied };
    }

    protected beautifyNodeInfo(info: Node) {
        let topicInfo = '';
        if (info.topics) {
            for (let i = 0; i < info.topics.length; i++) {
                const topic = info.topics[i];
                topicInfo += 
`  - ID  ${topic.id}
  - 名称  ${topic.name}
  - 创建时间  ${topic.created_at}
  - 更新时间  ${topic.updated_at? topic.updated_at : '无' }
  - 消息总数  ${topic.message_count}
  - 想法总数  ${topic.thought_count}\n`;
                if (i != info.topics.length - 1)
                    topicInfo +=`  - -----------------------\n`;
            }
        } else {
            topicInfo = '  无法获取未加入据点的话题/节点信息';
        }
        const nodeInfo = 
`\n# ${info.name}
- ID  ${info.id}
- 据点ID  ${info.node_name? info.node_name : '无'}
- MewCode  ${info.mew_code}
- 创建时间  ${info.created_at}
- 更新时间  ${info.updated_at? info.updated_at : '无'}
- 成员数量  ${info.member_count}
- 想法总数  ${info.thought_count}
- 标签  ${info.tags.length == 0? '无': info.tags.join(' ')}
- 规模  ${info.map_size} × ${info.map_size}
- 加入问题  ${info.enable_join_question? info.join_questions[0].content : '已禁用'}
- 话题/节点
${topicInfo}`;
        return nodeInfo;
    }

}
