// pages/category/index.js
import { request } from "../../request/index.js";
import regeneratorRuntime from '../../lib/runtime/runtime';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 左侧的菜单数据
    leftMenuList:[],
      // 右侧的菜单数据
    rightContent:[],
    // 被点击的左侧的菜单
    currentIndex:0,
    // 右侧内容的滚动条距离顶部的距离
    scrollTop:0
  },
  // 接口的返回数据
  cates:[], 

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    /*
    0 web中的本地存储和小程序中的本地存储的区别
       (1)写代码的方式不一样web:localStorage.setItem("key","value");  localStorage.getItem("key") ;
         小程序中：wx.setStorageSync("key","value"); wx.getStorageSync("key");
       (2)村的时候 有没有做类型转换
       web:不管存入的是什么类型的数据，最终都会先调用以下 toString()，把数据变成了字符串 再存入进去
       小程序：不存在 类型转换这个操作 存什么类型的数据进去，获取的时候就是什么类型
    1 先判断一下本地缓存中有没有旧的数据
    {time:Date.now(),data:[…]}
    2 没有旧的数据 直接发送新请求
    3 有旧的数据 同时 旧的数据也没有过期的话， 就是用本地缓存中的旧数据即可
    */ 
  //  1 获取本地存储中的数据（小程序中也存在本地存储的技术）
  const cates = wx.getStorageSync("cates");
  // 2 判断
  if(!cates){
    // 不存在 发送请求数据
    this.getCates();
  }else{
    // 有旧的数据 定义过期时间10s
    if(Date.now() - cates.time > 1000*10){
      // 重新发送请求
      this.getCates();
    }else{
      // 可以使用旧的数据
      // console.log('可以使用旧的数据');
      this.cates = cates.data;
      console.log(cates);
      let leftMenuList = this.cates.map(v=>v.cat_name);
      // 构造右侧的商品数据
      let rightContent = this.cates[0].children;
      this.setData({
        leftMenuList, 
        rightContent
      })
    }
    
  }
},
//获取分类数据
  async getCates(){
    // request({
    //   url:"/categories"
    // })
    // .then(res=>{
    //   console.log(res);
      
    //   this.cates = res.data.message;
    //   // 把接口的数组存在本地存储中  
    //   wx.setStorageSync("cates",{time:Date.now(),data:this.cates});
    //   // 构造左侧的大菜单数据
    //   let leftMenuList = this.cates.map(v=>v.cat_name);
    //   // 构造右侧的商品数据
    //   let rightContent = this.cates[0].children;
    //   this.setData({
    //     leftMenuList, 
    //     rightContent
    //   })
    // })
    // 使用es7的async await 发送异步请求(这里的优化是将异步代码改成同步代码)
    const res=await request({url:"/categories"});
    this.cates = res;
      // 把接口的数组存在本地存储中  
    wx.setStorageSync("cates",{time:Date.now(),data:this.cates});
      // 构造左侧的大菜单数据
    let leftMenuList = this.cates.map(v=>v.cat_name);
    // 构造右侧的商品数据
    let rightContent = this.cates[0].children;
    this.setData({
      leftMenuList, 
      rightContent
    })
  
},
  // 左侧菜单的点击事件
  handleItemTap(e){
    // 1 获取被点击的标题身上的索引
    // 2 给data中的currentIndex赋值就可以了
    // 3 根据不同的索引显示不同的右侧内容
    
    const {index} = e.currentTarget.dataset;
    let rightContent = this.cates[index].children;
    this.setData({
      currentIndex:index, 
      rightContent,
       // 重新设置 右侧内容的scroll-view标签距离顶部的距离
       scrollTop:0
    })
   
  }
})