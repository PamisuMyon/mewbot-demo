/**
 * 回复消息时使用回复功能的模式
 */
 export enum MesageReplyMode {
    /**
     * 不做任何操作（不使用回复功能）
     */
    None = 'none',
    /**
     * 总是使用回复功能（有消息id可以回复时）
     */
    Always = 'always',
    /**
     * 仅在衍生话题中使用回复功能，即回复bot的消息、回复他人的消息但触发bot
     */
    Derivative = 'derivative',
}

/**
 * 配置项
 * 实际使用中，请考虑使用数据库或文件形式实现
 */
export default {
    // bot别名，在判断@bot时与bot的账号、用户名等效
    alias: ["bot", "萝卜", "🤖"],
    // 触发bot的方式
    triggers: {
        username: true,     // @MEWID
        name: false,        // @昵称
        alias: true,        // @别名
        mention: true,      // 预留未来可能会有的官方@功能
        reply: true,        // 回复bot的消息
        command: false,     // TODO 识别指令模式
    },
    replyDM: false,      // 是否回复私聊消息
    messageReplyMode: MesageReplyMode.Derivative,   // 回复功能使用模式
    messageProcessInterval: 200,    // 消息处理间隔（毫喵）
    // 订阅据点，将会收到来自这些据点的消息
    nodes: [
        "100554577263091712",   // 不是机器人
        "222154400563036160",   // 🦴
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
                kudos: {},
                mew: {},
                picture: {
                    spam: {
                        interval: 60000,
                        threshold: 3,
                        cooldown: 120000,
                    }
                },
            }
        },
        // 在 🦴 据点的 🦴 话题（节点中），配置所有功能
        "222154400563036161": {
            name: "🦴",
            repliers: {
                chat: {},
                crash: {
                    defaultTimeout: 100,
                },
                dice: {},
                help: {},
                kudos: {},
                mew: {},
                picture: {
                    spam: {
                        interval: 120000,
                        threshold: 3,
                        cooldown: 20000,
                    }
                },
            }
        },
    } as TopicsConfig,
    // 提示文本
    hints: {
        replierUnavailable: [
            "对不起，本节点不支持这个功能😿"
        ],
        fallback: [
            "我不知道怎么跟你说，因为我只是一个机器人",
        ]
    },
    // 防御机制，用来避免短时间内被频繁刷屏，例如两个bot互相回复陷入死循环
    defender: {
        interval: 1000,     // 连击生效间隔
        threshold: 10,      // 防御连击阈值，达到此阈值时将对方加入屏蔽列表
    },
};

export interface TopicsConfig {
    [topicId: string]: TopicConfig;
}

export interface TopicConfig {
    name: string;
    repliers: { [type: string]: ReplierConfig };
}

export interface ReplierConfig {
    [key: string]: any;
    spam?: {
        interval?: number;
        threshold?: number;
        cooldown?: number;
    }
}
