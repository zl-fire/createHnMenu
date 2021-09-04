var path = require("path");
import docx2html from "./docx2html";
let zl_nodefs = require("zl-nodefs");
let {
    readFileList,//读取目录下的文件列表
} = zl_nodefs;
/**
    * @description 传入一个目录路径，将此路径下的所有docx文件批量转换为html文件（不管层级有多深）
    * @param {Object} parObj 完整的参数对象信息
    * @param {String} parObj.dirPath 要处理目录路径，可传入绝对路径，也可传入相对路径
    * @param {String} parObj.outPath 要输出的html文档路径
    * @param {Boolean} parObj.isAddHtmlHead  是否给转换后的文档添加html,body等标签
    * @param {Boolean} parObj.isAddMenu   是否给转换后的html文件注入锚点菜单
    * @param {Boolean} parObj.autoHsSty   是否添加手动注入的h1--h6的大小样式
    * @param {Boolean} parObj.isAddOrder   是否添加手动生成的序号
    * @param {Boolean} parObj.isAddpagePadV   是否给页面注入默认的padding值
    * @param {Boolean} parObj.manualAssignment   用户手动注入的样式对象
    * @param {Boolean} parObj.showWarnMessage   是否显示docx文档转换为html时的警告信息（如果有的话），默认显示
    * @param {Boolean} parObj.showExeResult   创建html文件时，是否要显示提示信息
    * @author zl-fire 2021/09/01
    * @example
    * 
    * let { batchDocx2html } = require("zl-docx2html");
    * batchDocx2html({
    *     dirPath: "./",
    *     outPath:"./HTML",
    *     showWarnMessage: false,
    * });
    * 
  */
async function batchDocx2html(parObj) {
    // 对参数进行解构
    let {
        dirPath,
        outPath,
        isAddHtmlHead = true,
        isAddMenu = true,
        showWarnMessage = true,
        showExeResult = true,
        autoHsSty = true,
        isAddOrder = true,
        isAddpagePadV = true,
        manualAssignment
    } = parObj;

    //获取指定路径下的所有docx文件，不限层级
    let list = readFileList({
        dirPath: dirPath,
        ignoreList: ["node_modules", ".git"],
        needTypes: [".docx"],
        isfilterEmptyDir: true
    });
    if (showExeResult) console.log("====当前目录结构为：=====\n", JSON.stringify(list, null, 4));
    // ========开始把list中的所有docx文件进行转换==========
    // 设置docx文件的基础路径
    let docxBasePath = dirPath;
    // 如果用户没有主动传入输出路径，就将html生成到当前word基础目录的同级目录下
    let htmlBasePath = outPath || path.join(docxBasePath, "../", "html" + new Date().getTime());
    await recursionCreateHtmlFile(list, docxBasePath, htmlBasePath);
    console.log("\n\n=============目录[" + docxBasePath + "]下的docx文件转换完毕================\n\n");

    async function recursionCreateHtmlFile(list, currentDocxPath, currentHtmlPath) {
        for (let i = 0; i < list.length; i++) {
            let obj = list[i];
            let { name, children } = obj;
            //   children存在，说明是目录
            if (children) {
                await recursionCreateHtmlFile(children, currentDocxPath + "/" + name, currentHtmlPath + "/" + name);
            }
            else {
                await docx2html({
                    docxPath: currentDocxPath + "/" + name,
                    outPath: currentHtmlPath + "/" + name.replace(name.match(/\.\w+$/)[0], "") + ".html",
                    isAddHtmlHead,
                    isAddMenu,
                    showWarnMessage,
                    showExeResult,
                    autoHsSty,
                    isAddOrder,
                    isAddpagePadV,
                    manualAssignment
                });

            }
        }
    }
}



export default batchDocx2html;
