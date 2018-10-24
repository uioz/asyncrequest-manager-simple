import { RequestManger,StragegyTree,Tasks,Stragegy,keyType,RunningDiagram } from "./types";
import { Dispatchers } from "./Dispatchers";
import { Tool } from "./tool";


export class AsyncRequestManagerSimple {

    private stragegyTree:StragegyTree;
    private tasks:Tasks;
    private tools:Tool;
    private dispatchers:Dispatchers;

    /**
     * 简单爬虫器
     * @param requestModule 请求模块
     */
    constructor(requestModule:RequestManger){
        // 挂载执行器
        this.dispatchers = new Dispatchers(requestModule);
        // 挂载工具类
        this.tools = new Tool();
        // 挂载策略树
        this.stragegyTree = this.tools.getInitActionTree();
        // 挂载任务树
        this.tasks = this.tools.getInitTasks();
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
     * 不过需要注意的是策略函数只能是同域下的策略函数
     * @param diagram 策略图
     */
    public use(diagram:RunningDiagram):void{

        const tasks = this.tasks;

        if(this.tools.hasParam(tasks,diagram.hostName)){

            this.tasks[diagram.hostName] = Object.assign(tasks[diagram.hostName],{
                [diagram.diagramName]:diagram
            });
            
            return;
        }

        this.tasks = Object.assign(tasks,{
            [diagram.hostName]:{
                [diagram.diagramName]:diagram
            }
        });

        return;
    }

    /**
     * execute
     */
    public execute(hostName:keyType,diagramName:keyType) {

        return this.dispatchers.execute(this.stragegyTree[hostName],this.tasks[hostName][diagramName]);
    }
    
}
