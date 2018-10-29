import { RequestManger,StragegyTree,Tasks,Stragegy,keyType,RunningDiagram } from "./types";
import { Dispatchers } from "./Dispatchers";
import { Tool } from "./tool";
import { timingSafeEqual } from "crypto";


export class AsyncRequestManagerSimple {

    private stragegyTree:StragegyTree = {};
    private tasks:Tasks = {};
    private tools:Tool;
    private dispatchers:Dispatchers;

    /**
     * 简单爬虫器
     * @param requestModule 请求模块
     */
    constructor(){
        // 挂载工具类
        this.tools = new Tool(this.tasks,this.stragegyTree);
        // 挂载执行器
        this.dispatchers = new Dispatchers(this.tools);
    }

    /**
     * 注册一个策略函数
     * @param hostName 域名
     * @param stragegyName 策略名称
     * @param stragegyFun 策略函数
     */
    public registerStragegy(hostName:keyType,stragegyName:keyType,stragegyFun:Stragegy):void{

        const stragegyTree = this.stragegyTree;
        
        if(this.tools.hasParam(stragegyTree,hostName)){

            this.stragegyTree[hostName] = Object.assign(stragegyTree[hostName],{
                [stragegyName]:stragegyFun
            });

            return;
        }

        this.stragegyTree = Object.assign(stragegyTree,{
            [hostName]:{
                [stragegyName]:stragegyFun
            }
        });

        return;
    }

    /**
     * 注册一个完整的策略数
     * 
     * - 没有域名创建域名
     * - 相同策略名则则覆盖策略函数
     * @param tree 策略树
     */
    public registerStragegyTree(tree:StragegyTree):void{
        for (const hostNameKey of Object.keys(tree)) {
            for (const stragegyNameKey of Object.keys(tree[hostNameKey])) {
                const stragegyFun = tree[hostNameKey][stragegyNameKey];
                this.registerStragegy(hostNameKey,stragegyNameKey,stragegyFun);
            }
        }
    }

    /**
     * 利用策略图注册一个任务
     * 
     * 该策略图中提供多个策略函数的组合
     * 
     * @param diagram 策略图
     */
    public use(runningDiagram:RunningDiagram):void{

        runningDiagram = this.tools.diagramComplete(runningDiagram);

        let tasks = this.tasks;

        tasks = Object.assign(tasks,{
            [runningDiagram.RunningDiagramName]:runningDiagram
        });

        return;
    }

    /**
     * 执行一个配置,并返回结果对象
     * @param runningDiagramName 配置的名称
     */
    public execute(runningDiagramName:keyType):Promise<any>{

        return this.dispatchers.execute(runningDiagramName);
    }

   /**
    * 快速启动模式,直接执行策略函数
    * @param stragegyFun 策略函数
    */
    public async fastBoot(...stragegyFun:Stragegy[]):Promise<any>{

        const hostName = 'fastBoot';
        const functionName = 'stragegyFunction';
        const runningDiagram:RunningDiagram = {
            hostName,
            RunningDiagramName:hostName,
            baseUrl:'unknow',
            diagrams:[]
        }

        let i = 0 , len = stragegyFun.length;

        while (i<len) {

            const stragegyName = functionName+i;

            this.registerStragegy(hostName,stragegyName,stragegyFun[i])
            runningDiagram.diagrams.push({
                stragegyName
            });

            i++;

        }

        this.use(runningDiagram);

        return this.execute(hostName);
    }
    
}
