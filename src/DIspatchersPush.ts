import { RunningDiagram, RequestManger, keyType, Stragegy, StragegyInf, StragegyHandle, Diagram } from "./types";
import { Tool } from "./tool";

/**
 * 该接口用于描述一个用于记号判断的对象
 */
interface exceptionMod {
    [key: string]: boolean;
    isRecursion: boolean;
    isConcurrent: boolean;
    isFail: boolean;
};

/**
 * 执行器类,他的作用是将传入的可执行策略图
 */
export class Dispatchers {

    private tools: Tool;

    private result: object = {};

    private flag: exceptionMod = {
        isRecursion: false,
        isConcurrent: false,
        isFail: false
    }

    private baseInf: StragegyInf;

    private handle: StragegyHandle = {
        arguments: {},
        stopRecursion: false,
        recursion: () => {
            if (this.flag.isFail || this.flag.isRecursion) {
                return;
            }
            this.flag.isRecursion = true;
        },
        concurrency: () => {
            if (this.flag.isFail || this.flag.isConcurrent) {
                return;
            }
            this.flag.isConcurrent = true;
        },
        fail: () => {
            if (this.flag.isFail || this.flag.isConcurrent || this.flag.isRecursion) {
                return;
            }
            this.flag.isFail = true;
        },
        getResult: () => {
            if (this.flag.isFail || this.flag.isConcurrent || this.flag.isRecursion) {
                return false;
            }
            return this.result;
        }
    };

    private runingDiagram: RunningDiagram;
    private diagrams: Diagram[];

    constructor(tools: Tool) {

        // 挂载工具类
        this.tools = tools;
    }

    private async failProcess() {

    }

    private async concurrentProcess() {

    }

    private async recursiveProcess() {

    }

    /**
     * 该方法用于策略图中提供了策略组的处理
     * @param runingDiagrams 多个可执行策略图
     * @param Arguments 启动参数
     */
    private async groupProcess(runingDiagrams:string[], Arguments: object) {

        const dispatcher = this.tools.getDispatchers();

        let i = 0, len = runingDiagrams.length;

        while (i < len) {

            try {
                // 只要挂载的值
                return await dispatcher.execute(runingDiagrams[i],Arguments,this.result);

            } catch {
                // node 10支持不获取参数
                // 执行直到获取到真正的结果
            }

            i++;

            if(i = len-1){
                return undefined;   
            }
        }

    }

    /**
     * 该方法将策略函数执行,根据策略函数调用不同的钩子.
     * 执行不同的操作策略.
     * 
     * @param diagram 策略图对象
     * @param Arguments 上一个策略图返回的参数对象
     */
    private async Process(diagram: Diagram, Arguments: object) {

        const stragegyFun: Stragegy = this.tools.getStragegy(this.runingDiagram.hostName, this.runingDiagram.diagramName);

        let returnArguments, isError: boolean = false;

        try {

            returnArguments = await stragegyFun(this.handle, this.baseInf);

        } catch (error) {

            // 没有tryError直接狗带
            if (!diagram.tryError) {
                throw new Error(`ERR_ASYNC_TYPE ${error}`);
            }

            // 有tryError提供一个flag
            isError = true;

        }

        if (isError || this.flag.isFail) {

            // 如果有备选可执行策略图就执行
            if(Array.isArray(diagram.stragegyGroup)){

                try {

                    return await this.groupProcess(diagram.stragegyGroup as string[],Arguments);
    
                } catch (error) {
    
                    if (!diagram.tryError) {
                        throw error;
                    }
    
                    return undefined;
    
                }

            }else{
                // 没有策略图但是有TryErro选项就返回undefined
                this.flag.isFail = false;
                return undefined;
            }

        } 

        // TODO 递归处理
        if(this.flag.isRecursion){

        }

        // TODO 并发处理
        if(this.flag.isConcurrent){

        }

        return returnArguments;
    }

    /**
     * 执行且获取可执行策略图最终的结果
     * 
     * **注意**:resultOption是一个相当特殊的选项,如果传入一个对象则意味着开启了备选可执行模式
     * 将只结果挂载到传入的对象身上而不会返回结果,代替返回结果的是最后一个策略函数返回的参数,这个参数将传入后续的策略函数中
     * 
     * @param Arguments 执行第一个策略函数的初始值
     * @param resultOption 使用该对象替换掉执行器中的结果对象.
     */
    public async execute(runningDiagramName: keyType, Arguments: object = {}, resultOption?:object):Promise<object>{

        this.result = resultOption?resultOption:{};

        // 挂载可执行图,包含基本信息
        this.runingDiagram = this.tools.getRunningDiagram(runningDiagramName);
        // 挂载策略函数组
        this.diagrams = this.runingDiagram.diagrams;
        // 挂载基本信息
        this.baseInf.baseUrl = this.runingDiagram.baseUrl;
        this.baseInf.diagramName = this.runingDiagram.diagramName;
        this.baseInf.hostName = this.runingDiagram.hostName;

        let i = 0, len = this.diagrams.length;

        while (i < len) {

            /**
             * 如果异步出错基本就是没有提供tryError,这里不会拦截
             * 
             * 此外使用tryError后不会返回结果,即下一个策略函数就没有参数.
             * 如果使用了备选可执行任务图均失败且使用了tryError则也不会报错.
             */
            const returnArguments = this.Process(this.diagrams[i], Arguments);

            if (returnArguments !== undefined) {
                Arguments = returnArguments;
            } else {
                Arguments = {};
            }

            i++;
        }

        // 返回最后一个策略函数的内容
        if(resultOption){
            return Arguments;
        }
        // 返回执行结果且过滤掉函数
        return JSON.parse(JSON.stringify(this.result));

    }

}
