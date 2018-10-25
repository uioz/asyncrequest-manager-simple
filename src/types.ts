
export type keyType = string | number;

/**
 * 请求参数接口
 * 
 * - taskName 任务名称
 * - hostName 域名名称
 * - queryUrl 扩展url的尾部
 * - query 查询字符串,键为查询,值为内容
 */
export interface RequestTask {
    taskName: string | symbol;
    hostName: string;
    queryUrl?: string[];
    query?: { [queryName: string]: string; };
}

/**
 * 请求模块接口
 * 
 * - request 以异步的方式请求一次
 * - requests 以异步的方式一次性请求多个任务
 * 
 * - 泛型参数
 *   - T 请求成功的类型
 */
export interface RequestManger {
    request<T>(task: RequestTask): Promise<T>;
    requests<T>(task: RequestTask[]): Promise<T>;
}



/**
 * 该接口描述了策略图
 */
export interface Diagram {
    stragegyName: string;
    stragegyGroup?: RunningDiagram[] | false;
    tryError?: boolean;
}

/**
 * 该接口描述了运行策略图
 * 
 * 被策略图执行器依赖
 */
export interface RunningDiagram {
    readonly hostName: string;
    readonly diagramName: string;
    readonly baseUrl: string;
    diagrams: Diagram[];
}


/**
 * 该接口描述了AsyncRequestManagerSimple类上如何挂载任务对象
 */
export interface Tasks {
    [diagramName: string]: RunningDiagram;
}

/**
 * 该接口定义了策略函数参数的基础类型
 */
export interface StragegyInf {
    hostName: string;
    diagramName: string;
    baseUrl: string;
}
/**
 * 该接口定义了策略函数钩子用于提供一系列操作
 */
export interface StragegyHandle {
    /**
     * 结果集
     */
    result: object;
    /**
     * 上个策略组传入的参数
     */
    arguments: object;
    /**
     * 要求停止进行递归的钩子
     * 
     * 如果该属性变为了函数也就意味着前一个策略函数要求拥有该钩子的策略函数进行递归
     */
    stopRecursion: (() => void)|false;
    /**
     * 要求下一个策略函数进行递归调用
     * 
     * 这里的参数将原封不动的传入下一个策略函数中
     */
    recursion: (...args) => void;
    /**
     * 要求下一个策略函数进行并发
     * 
     * 提供给回调钩子多少个参数,就并发多少个下一个策略函数
     * 
     * 提供的参数将原封不动的提供给并发函数
     */
    concurrency: (...args) => void;
}

/**
 * 该接口定义了策略函数
 * 
 */
export interface Stragegy {
    (Handle: StragegyHandle, base: StragegyInf): Promise<any>;
}

/**
 * 该接口描述了AsyncRequestManagerSimple如何挂载策略对象
 */
export interface StragegyTree {
    [hostName: string]: {
        [strageName: string]: Stragegy
    }
}















