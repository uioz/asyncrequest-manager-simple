import { RunningDiagram, RequestManger, keyType, Stragegy, StragegyInf, StragegyHandle, Diagram } from "./types";
import { Tool } from "./tool";

/**
 * 执行器类,他的作用是将传入的可执行策略图
 */
export class Dispatchers {

    private requestManger: RequestManger;
    private tools: Tool;

    constructor(requestModule: RequestManger, tools: Tool) {
        this.requestManger = requestModule;
        this.tools = tools;
    }

    /**
     * 异步执行器
     */
    public async execute(runningDiagramName: keyType) {

        /**
         * 该接口用于描述一个用于记号判断的对象
         */
        interface exceptionMod {
            [key: string]: boolean;
            isRecursion: boolean;
            isRoncurrency: boolean;
            isFail:boolean;
        };

        /**
         * 提供进入递归模式和并发模式的判断
         */
        const flag: exceptionMod = {
            isRecursion: false,
            isRoncurrency: false,
            isFail:false
        };

        /**
         * 检查一个用于特殊情况判断的对象上是否出现了特殊情况
         * @param flag 提供了特殊情况保留的对象
         */
        function findException(flag: exceptionMod): boolean {
            for (const key of Object.keys(flag)) {
                if (flag[key]) {
                    return true;
                }
            }
            return false;
        };


        const runningDiagram: RunningDiagram = this.tools.getRunningDiagram(runningDiagramName);
        const diagrams: Diagram[] = runningDiagram.diagrams;



        /**
         * 传递给策略函数的基础信息
         */
        const baseInf: StragegyInf = {
            hostName: runningDiagram.hostName,
            diagramName: runningDiagram.diagramName,
            baseUrl: runningDiagram.baseUrl,
        };

        /**
         * 传递给策略函数的控制钩子
         */
        const handle: StragegyHandle = {
            result: {},
            arguments: {},
            stopRecursion: false,
            recursion: () => {
                flag.isRecursion=true;
            },
            concurrency: () => {
                flag.isRoncurrency=true;
            },
            fail:()=>{
                flag.isFail=true;
            }
        };

        let i = 0, len = diagrams.length;

        while (i < len) {

            const diagram: Diagram = diagrams[i];
            const stragegy = this.tools.getStragegy(baseInf.hostName, diagram.stragegyName)
            // 获取请求内容
            const result = await stragegy(handle, baseInf);
            
            if(flag.isFail){

                if(diagram.tryError){
                    flag.isFail=false;
                    i++;
                    continue;
                }
                // TODO 规范错误抛出
                throw new Error()
                
            }

            // 如果是递归则递归处理
            if (flag.isRecursion) {

            }
            // 如果是并发则并发处理
            if (flag.isRoncurrency) {

            }
            

            i++;
        }


        return handle.result;
    }
}

// TODO pushTask中的排序器

// TODO 请求模块中的头文件也是可以配置的