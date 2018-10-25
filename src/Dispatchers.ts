import { RunningDiagram, RequestManger, keyType, Stragegy, StragegyInf, StragegyHandle, Diagram } from "./types";
import { Tool } from "./tool";

/**
 * 执行器类,他的作用是将传入的可执行策略图
 */
export class Dispatchers {

    private tools: Tool;

    constructor(tools: Tool) {
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
            isConcurrent: boolean;
            isFail: boolean;
        };

        /**
         * 提供进入递归模式和并发模式的判断
         */
        const flag: exceptionMod = {
            isRecursion: false,
            isConcurrent: false,
            isFail: false
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
                if (flag.isFail || flag.isRecursion) {
                    return;
                }
                flag.isRecursion = true;
            },
            concurrency: () => {
                if (flag.isFail || flag.isConcurrent) {
                    return;
                }
                flag.isConcurrent = true;
            },
            fail: () => {
                flag.isConcurrent = flag.isRecursion = false;
                flag.isFail = true;
            }
        };

        let i = 0, len = diagrams.length;

        while (i < len) {

            const diagram: Diagram = diagrams[i];
            const stragegy:Stragegy = this.tools.getStragegy(baseInf.hostName, diagram.stragegyName)
            // 获取请求内容
            let result = await stragegy(handle, baseInf);

            if (flag.isFail) {

                flag.isFail = false;

                // 如果没有备用组又没有tryError
                if (!diagram.stragegyGroup && diagram.tryError) {
                    // 抛出异步资源错误
                    throw new Error('ERR_ASYNC_TYPE');
                }

                // 有任务组执行任务组
                if (Array.isArray(diagram.stragegyGroup)) {

                    let k = 0, l = diagram.stragegyGroup.length;

                    while (k < l) {

                        try {
                            // 如果没有报错则获取返回结果且赋值并停止循环
                            result = await this.execute(diagram.stragegyGroup[k].diagramName)
                            break;
                        } catch (error) {
                            if (k == l - 1) {
                                // 如果到了最后一次还没有结果但是有tryError
                                if (diagram.tryError) {
                                    break;
                                }
                                throw new Error(`ERR_ASYNC_TYPE${error}`);
                            }
                        }

                        k++;
                    }

                } else if (diagram.tryError) {
                    // 直接跳过循环
                    i++;
                    continue;
                }

            }

            // 如果是递归则递归处理
            if (flag.isRecursion) {

                i++;
                if (i => len) {
                    throw new Error(`ERR_ASYNC_TYPE  Can't use recursion mode of last task.`);
                }

                const nextStragegy = 

                handle.stopRecursion = () => {  };


            }
            // 如果是并发则并发处理
            if (flag.isConcurrent) {

            }

            handle.arguments = result;

            i++;
        }


        return handle.result;
    }
}

// TODO pushTask中的排序器

// TODO 请求模块中的头文件也是可以配置的