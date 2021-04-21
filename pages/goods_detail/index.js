// pages/goods_detail/index.js
/*
   1 发送请求获取数据
   2 点击轮播图 预览大图
      1 给轮播图绑定点击事件
      2 调用小程序的api previewImage
   3 点击加入购物车
      1 先绑定点击事件
      2 获取缓存中的购物车数据 数组格式
      3 先判断 当前的商品是否已经存在于购物车
      4 已经存在 修改商品数据 执行购物车数量++ 重新把购物车数组填充回缓存中
      5 假如商品是第一次添加 直接给购物车数组添加新元素 带上购买数量属性 重新把购物车数组填充回缓存中
      6 弹出提示

*/ 
import { request } from "../../request/index.js";
import regeneratorRuntime from '../../lib/runtime/runtime';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsObj:{}
  },
// 商品对象
GoodsInfo:{},
goods_id:'',
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const {goods_id}=options;
    this.getGoodsDetail(goods_id);
  },

// 获取商品详情数据
  async getGoodsDetail(goods_id){
    const goodsObj=await request({url:"/goods/detail",data:{goods_id}});
    this.GoodsInfo = goodsObj;
    console.log(goodsObj);
    this.setData({
      goodsObj:{
        pics:goodsObj.pics,
        goods_name:goodsObj.goods_name,
        goods_price:goodsObj.goods_price,
        // iphone部分手机 不识别webp图片格式
        // 最好找后台修改
        // 临时自己修改 确保后台存在1 . webp => 1.jpj 使用正则表达式
        goods_introduce:goodsObj.goods_introduce.replace(/\.webp/g,'.jpg')    
      }
     
    })
  },
  // 点击轮播图放大预览
  handlePrevewImage(e){
    // 1 先构造要预览的图片数组
    const urls=this.GoodsInfo.pics.map(v=>v.pics_mid);
    // 2 接收传递过来的图片
    const current = e.currentTarget.dataset.url;
    wx.previewImage({
      current: current, // 当前显示图片的http链接
      urls: urls// 需要预览的图片http链接列表
    })
  },
  
  // 点击记入购物车
  handleCartAdd(e){
    console.log("购物车");
    // 1 获取缓存中的购物车 数组
    let cart=wx.getStorageSync("cart")||[];
    // 2 判断 商品对象是否存在于购物车数组中
    let index = cart.findIndex(v=>v.goods_id===this.GoodsInfo.goods_id);
    if(index===-1){
      // 3 不存在 第一次添加
      this.GoodsInfo.num=1;
      this.GoodsInfo.checked = true;
      cart.push(this.GoodsInfo);
    }else{
      //4 已经存在购物车数据了 执行num++
      cart[index].num++;
    }
    // 5 把购物车重新添回缓存中
    wx.setStorageSync("cart", cart);
    // 6 弹窗提示
    wx.showToast({
      title: '加入成功',
      icon: 'success',
      //true 防止用户 手抖 疯狂点击按钮
      mask: true,
    });
  }
})