
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
     * 拥有该钩子意味着当前执行已经进入了递归模式.
     * 调用该钩子则停止递归.
     * 此时return(async)或者resolve()的值将交由下一个策略函数
     */
    stopRecursion: (() => void)|false;
    /**
     * 要求当前策略函数进行递归调用.
     * 
     * reutrn(async)或者resolve()返回的值将会传入下一次自己的递归调用中.
     * 在递归过程中该选项则会变为false.
     */
    recursion: () => void|false;
    /**
     * 要求下一个策略函数进行并发
     * 
     * return(async)或者resolve()的时候提供一个数组.
     * 数组的长度会被当做并发的数量而,数组的每一个项目都会被当做一个参数传入到对应的并发函数中.
     */
    concurrency: () => void;
    /**
     * 调用该函数后则会停止这个策略函数,返回的结果也会抛弃.
     * 
     * 如果调用该方法的策略函数挂载的策略图上tryError属性为true则不会报错.
     * 会跳过这个策略函数,反之就会报错.
     */
    fail:()=>void;
}

/**
 * 该接口定义了策略函数.
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















