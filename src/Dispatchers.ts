import { RunningDiagram,RequestManger,keyType,Stragegy,StragegyInf,StragegyHandle } from "./types";
import { Tool } from "./tool";

/**
 * 执行器类,他的作用是将传入的可执行策略图
 */
export class Dispatchers{

    private requestManger:RequestManger;
    private tools:Tool;

    constructor(requestModule:RequestManger,tools:Tool){
        this.requestManger = requestModule;
        this.tools = tools;
    }

    /**
     * 异步执行器
     */
    public async execute(runningDiagramName:keyType){

        const runningDiagram:RunningDiagram = this.tools.getRunningDiagram(runningDiagramName);
        
        /**
         * 提供进入递归模式和并发模式的判断
         */
        const flag = {
            isRecursion:false,
            isRoncurrency:false
        }

        /**
         * 传递给策略函数的基础信息
         */
        const baseInf:StragegyInf = {
            hostName:runningDiagram.hostName,
            diagramName:runningDiagram.diagramName,
            baseUrl:runningDiagram.baseUrl,
        };
        
        /**
         * 传递给策略函数的控制钩子
         */
        const handle:StragegyHandle ={
            result:{},
            arguments:{},
            stopRecursion:false,
            // TODO
            recursion:(...rest)=>{

            },
            // TODO
            concurrency:(...rest)=>{

            }
        };
        

        return handle.result;
    }
}

// TODO pushTask中的排序器