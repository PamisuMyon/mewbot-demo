/**
 * 配置项
 * 实际使用中，请考虑使用数据库或文件形式实现
 */
export default {
    // bot别名，在判断@bot时与bot的账号、用户名等效
    alias: ["bot", "萝卜", "🤖"],
    // 是否允许@bot使用bot的MEWID、昵称、别名
    allowAt: {
        // username: true,  // 默认允许@MEWID
        name: false,
        alias: true,
        mention: true,  // 预留未来可能会有的官方@功能
    },
    replyDM: false,      // 是否回复私聊消息
    messageProcessInterval: 200,    // 消息处理间隔（毫喵）
    // 订阅据点，将会收到来自这些据点的消息
    nodes: [
        "100554577263091712",   // 不是机器人
    ],
    // 话题（节点）功能配置，群聊中仅回复已配置话题中的消息，同时通过此配置实现话题中的功能定制
    topics: {
        // 在 不是机器人据点 的 🐱 话题（节点）中，配置掷骰子、帮助等功能
        "100554577309229056": {
            name: "🐱",
            repliers: {
                crash: {
                    defaultTimeout: 100,
                },
                dice: {},
                help: {},
            }
        },
        // 在 不是机器人据点 的 🍄 话题（节点）中，配置所有功能
        "219353468583456768": {
            name: "🍄",
            repliers: {
                chat: {},
                crash: {
                    defaultTimeout: 100,
                },
                dice: {},
                help: {},
                mew: {},
                picture: {},
            }
        },
    } as any,
    hints: {
        replierForbidden: [
            "对不起，本节点不支持这个功能😿"
        ],
        fallback: [
            "我不知道怎么跟你说，因为我只是一个机器人",
        ]
    },
};
