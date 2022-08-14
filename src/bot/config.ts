/**
 * bot配置项
 * 
 * 大部分配置支持在bot运行时动态刷新，参考{@link IStorage} {@link FileStorage}
 */
export interface BotConfig {
    /**
     * bot别名，在判断@bot时与bot的账号、用户名等效 
     */ 
    alias: string[];
    /**
     * 触发bot的方式
     */
    triggers: {
        /**
         * @MEWID
         */
        username: boolean;
        /**
         * @昵称
         */
        name: boolean;
        /**
         * @别名
         */
        alias: boolean;
        /**
         * 预留未来可能会有的官方@功能
         */
        mention: boolean;
        /**
         * 回复bot的消息
         */
        reply: boolean;
        /**
         * TODO 识别指令模式
         */
        command: boolean;
    };
    /**
     * 是否回复私聊消息
     */
    replyDM: boolean;
    /**
     * 回复功能模式
     */
    messageReplyMode?: MesageReplyMode;
    /**
     * 消息处理间隔（毫喵）
     */
    messageProcessInterval?: number;
    /**
     * 订阅据点，将会收到来自这些据点的消息
     */
    nodes: string[];
    /**
     * 话题（节点）功能静态配置
     * 
     * 群聊中仅回复已配置话题中的消息，同时通过此配置实现话题中的功能定制
     */
    topics: TopicsConfig;
    /**
     * 提示文本
     */
    hints: {
        /**
         * 回复器在此话题/节点不可用
         */
        replierUnavailable: string[];
        /**
         * 缺省回答
         */
        fallback: string[];
    };
    /**
     * 防御机制，用来避免短时间内被频繁刷屏，例如两个bot互相回复陷入死循环
     */
    defender?: {
        /**
         * 连击生效间隔
         */
        interval: 1500;
        /**
         * 防御连击阈值，达到此阈值时将对方加入屏蔽列表
         */
        threshold: 10;
    };
}

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
 * 话题/节点配置集合
 */
export interface TopicsConfig {
    [topicId: string]: TopicConfig;
}

/**
 * 话题/节点配置
 */
export interface TopicConfig {
    name: string;
    repliers: { [type: string]: ReplierConfig };
}

/**
 * 回复器配置
 */
export interface ReplierConfig {
    /**
     * 自定义属性
     */
    [key: string]: any;
    /**
     * 指令冷却配置 参照{@link Spam}
     */
    spam?: {
        /**
         * 连击生效间隔
         */
        interval?: number;
        /**
         * 冷却连击阈值
         */
        threshold?: number;
        /**
         * 冷却时间 单位毫秒
         */
        cooldown?: number;
    }
}

export interface Account {
    token?: string;
    username?: string;
    password?: string;
}

/**
 * 默认配置
 */
export const defaultConfig: Required<BotConfig> = {
    alias: [],
    triggers: {
        username: true,
        name: false,
        alias: true,
        mention: true,
        reply: true,
        command: false, // TODO 识别指令模式
    },
    replyDM: true,
    messageReplyMode: MesageReplyMode.Derivative,
    messageProcessInterval: 200,
    // 订阅据点，将会收到来自这些据点的消息
    nodes: [
        "100554577263091712", // 不是机器人
    ],
    // 话题（节点）功能配置，群聊中仅回复已配置话题中的消息，同时通过此配置实现话题中的功能定制
    topics: {
        // 在 不是机器人据点 的 🍄 话题（节点）中，配置功能
        "219353468583456768": {
            name: "🍄",
            repliers: {}
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
        interval: 1500,
        threshold: 10, // 防御连击阈值，达到此阈值时将对方加入屏蔽列表
    },
};
