
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
    stragegyName:string;
    stragegyGroup?:string[]|false;
    tryError?:boolean;
}

/**
 * 该接口描述了运行策略图
 * 
 * 被策略图执行器依赖
 */
export interface RunningDiagram {
    hostName:string;
    diagramName:string;
    baseUrl:string;
    diagrams:Diagram[];
}


/**
 * 该接口描述了AsyncRequestManagerSimple类上如何挂载任务对象
 */
export interface Tasks {
    [hostName:string]:{
        [diagramName:string]:RunningDiagram
    }
}

/**
 * 该接口定义了策略函数参数的基础类型
 */
interface StragegyInf {
    hostName:string;
    diagramName:string;
    baseUrl:string;
}
/**
 * 该接口定义了策略函数钩子用于提供一系列操作
 */
interface StragegyHandle{
    /**
     * 结果集
     */
    result:object;
    /**
     * 上个策略组传入的参数
     */
    arguments:object;
    /**
     * 递归参数由上次递归的函数传入
     */
    recursionArgs?:any;
    /**
     * 递归自己一次,返回的参数交由下一次的recursionArgs
     */
    recursion:(...args)=>void;
    /**
     * 由之前的并发传入
     */
    concurrencyArgs:any;
    /**
     * 并发自己多次,第一个参数是并发的数量
     * 
     * 后续的多个参数按照顺序传给
     */
    concurrency:(processNum:number,...args)=>void;
}

/**
 * 该接口定义了策略函数
 * 
 */
export interface Stragegy {
    (Handle:StragegyHandle,base:StragegyInf):Promise<any>;
}

/**
 * 该接口描述了AsyncRequestManagerSimple如何挂载策略对象
 */
export interface StragegyTree {
    [hostName:string]:{
        [strageName:string]:Stragegy
    }
}















