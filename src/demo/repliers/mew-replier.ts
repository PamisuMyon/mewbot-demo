import { Message, Node } from "mewbot";
import { MatryoshkaReplier,  TestInfo, IBot, ReplyResult, Replier, NoConfidence, Replied } from "../../bot/index.js";

export class MewReplier extends MatryoshkaReplier {
    override type = 'mew';

    protected override _children = [
        new NodeInfoSubReplier(),
    ];

}

class NodeInfoSubReplier extends Replier {

    type = 'mew/node-info' ;

    protected _regex = /(查询)?据点(信息)? *　*(.*)/;

    override async test(msg: Message): Promise<TestInfo> {
        const r = this._regex.exec(msg.content as string);
        if (r) {
            return { confidence: 1, data: r[3] };
        }
        return NoConfidence;
    }

    override async reply(bot: IBot, msg: Message, test: TestInfo): Promise<ReplyResult> {
        if (!test.data) {
            await bot.replyText(msg, '指令输入错误，需要指定据点ID');
            return Replied;
        }
        const info = await bot.client.getNodeInfo(test.data as string);
        if (info.data) {
            await bot.replyText(msg, this.beautifyNodeInfo(info.data));
        } else {
            let hint: string;
            if (info.error?.status == 404) {
                hint = '据点不存在👀';
            } else {
                hint = '获取据点信息失败😭';
            }
            await bot.replyText(msg, hint);
        }
        return Replied;
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
