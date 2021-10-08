<template>
  <div class="loginBody">
    <div class="centerDiv">
      <div class="loginMain">
        <!-- 登录框头部--图标 -->
        <div class="mainLogoWrap">
          <img class="mainLogo" width="100%" src="../assets/img/loginLogo.png" alt />
        </div>
        <div class="mainInfo">
          <h1>{{ Global.webTitle }}</h1>
          <div class="loginBar"></div>
          <div class="info">
            <p>账&nbsp;号</p>
            <el-input style="width:300px;" v-model.trim="cid">
              <img slot="prefix" src="../assets/img/cid.png" width="22" alt />
            </el-input>
          </div>
          <div class="info">
            <p>密&nbsp;码</p>
            <el-input type="password" style="width:300px;" v-model="password" @keydown.native="keyLogin">
              <img slot="prefix" src="../assets/img/password.png" width="22" alt />
            </el-input>
          </div>
          <div class="submit" @click="loginSubmit">登录</div>
          <div style="margin-top:10px;">
            <span style="position:relative;float:right;right:60px;" @click="rememberPassWord = !rememberPassWord">
              <input style="width:14px;height:14px;vertical-align:middle;" type="checkbox" value
                v-model="rememberPassWord" /><span
                style="color:gray;vertical-align:middle;user-select:none;">自&nbsp;动&nbsp;登&nbsp;录</span>
            </span>
          </div>
        </div>
      </div>
      <div class="bottomButton" v-if="Global.webTitle != Global.sysTitle.supply.webTitle">
        <div class="bottomBtn" @click="maskShow = true">
          <img src="../assets/img/img/Android.png" style="vertical-align:middle;" width="23" />
          <span style="vertical-align:middle">安卓版下载 ></span>
        </div>
        <div class="bottomBtn" @click="maskShow2 = true">
          <img src="../assets/img/img/Apple.png" style="vertical-align:middle;" width="23" />
          <span style="vertical-align:middle">苹果版下载 ></span>
        </div>
      </div>
    </div>
    <div class="loginTitle">
      <img width="100%" src="../assets/img/loginTitle.png" alt />
    </div>
    <div class="kuaidi100">
      <a href="https://kuaidi100.com/" target="_blank">快递查询</a>
    </div>
    <div v-if="maskShow" class="photoMask" @click="maskShow = false">
      <div class="photoMaskContain">
        <img style="width:320px;" src="../assets/img/QRCode.png" alt="" />
        <div style="color:white;margin:top:20px;font-size:18px;">
          手机扫一扫即可下载
        </div>
      </div>
    </div>
    <div v-if="maskShow2" class="photoMask" @click="maskShow2 = false">
      <div class="photoMaskContain">
        <img style="width:320px;" src="../assets/img/QRCode-IOS.png" alt="" />
        <div style="color:white;margin:top:20px;font-size:18px;">
          手机扫一扫即可下载
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Cookies from "js-cookie";
import { userLogin } from "@/api/user";
import { mapMutations } from "vuex";

export default {
  name: "Login",
  data() {
    return {
      cid: "", //用户账号
      password: "", //用户密码
      maskShow: false,
      maskShow2: false,
      rememberPassWord: true,
      autoSign: true
    };
  },
  methods: {
    ...mapMutations("navTabs", ["emptyTabList"]),
    keyLogin(e) {
      if (e.keyCode == 13) {
        this.loginSubmit();
      }
    },
    loginSubmit() {
      if (this.cid === "") {
        this.$alert("请输入用户账号", "提示", {
          type: "warning",
          confirmButtonText: "确定"
        });
        return;
      }
      if (this.password === "") {
        this.$alert("请输入密码", "提示", {
          type: "warning",
          confirmButtonText: "确定"
        });
        return;
      }
      let date = new Date();
      //账号首位转大写
      let cidArr = this.cid.split("");
      cidArr[0] = cidArr[0].toUpperCase();
      let cid = cidArr.join("");
      let obj = {
        loginName: cid,
        password: this.password,
        year: date.getFullYear()
      };
      Cookies.remove("cid");
      Cookies.remove("customerType");
      userLogin(obj).then(res => {
        if (res.data.stopped == 1) {
          this.$alert("账号被禁用，无法登录", "提示", {
            type: "warning",
            confirmButtonText: "好的"
          });
          return;
        }
        Cookies.set("cid", cid);
        sessionStorage.setItem("_userId", cid); // http里面使用
        if (res.pos) res.data.pos = res.pos;
        Cookies.set("userInfo", res.data);
        Cookies.set("isManager", res.data.isManager);
        Cookies.set("realName", res.data.realName);
        let companyId = res.data.companyId === null ? "null" : res.data.companyId;
        Cookies.set("companyId", companyId);
        Cookies.set("customerMainId", res.data.customerMainId);
        Cookies.set("identity", res.data.type);
        if (res.customerType === "") {
          if (res.data.type === "USER") {
            Cookies.set("customerType", "110");
          }
        } else {
          Cookies.set("customerType", res.customerType);
        }
        this.emptyTabList();
        if (this.rememberPassWord) {
          window.localStorage.setItem("username", cid);
          window.localStorage.setItem("password", this.password);
        } else {
          window.localStorage.setItem("username", "");
          window.localStorage.setItem("password", "");
        }
        window.localStorage.setItem("rememberPassWord", this.rememberPassWord);
        this.$router.push({
          path: "/main"
        });
        this.$router.go(0); //刷新页面
      })
        .catch(err => {
          this.$alert(`${err.msg}`, "提示", {
            type: "warning",
            confirmButtonText: "好的"
          });
        });
    }
  },
  mounted() {
    if (this.$route.params && this.$route.params.autoSign != undefined) {
      this.autoSign = this.$route.params.autoSign;
    } else {
      this.autoSign = true;
    }
    this.cid = window.localStorage.getItem("username");
    this.password = window.localStorage.getItem("password");
    this.rememberPassWord =
      window.localStorage.getItem("rememberPassWord") == "true";
    if (this.cid && this.password && this.autoSign) this.loginSubmit();
  }
};
</script>
<style scoped>
.loginBody {
  min-width: 1000px;
  min-height: 600px;
  width: 100%;
  height: 100%;
  background: url("../assets/img/loginBg.jpg") no-repeat;
  background-size: cover;
}
.loginTitle {
  width: 16.9%;
  position: fixed;
  bottom: 3.5%;
  right: 2%;
}
.kuaidi100 {
  position: fixed;
  bottom: 3.5%;
  left: 2%;
}
.centerDiv {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -43%);
}
.loginMain {
  width: 27em;
  height: 28em;
  background-color: #fff;
  box-shadow: 4px 2px 20px 1px rgba(0, 0, 0, 0.25);
  border-radius: 20px;
  font-size: 15px;
}
.mainLogoWrap {
  width: 6.5em;
  position: relative;
  margin: 0 auto;
}
.mainLogo {
  position: relative;
  top: -3.25em;
}
.mainInfo {
  position: relative;
  top: -3em;
}
.mainInfo h1 {
  text-align: center;
  font-size: 1.65em;
  color: #333;
  font-weight: 400;
  margin: 0;
}
.loginBar {
  width: 21em;
  height: 3.5px;
  border-radius: 50%;
  background: radial-gradient(#82bc00 85%, white 15%);
  margin: 20px auto 0;
}
.info {
  margin-top: 1.3em;
  text-align: center;
  font-size: 1em;
}
.info p {
  padding: 0 0 5px 0;
  text-align: left;
  margin: 0;
  color: gray;
  margin-left: 60px;
}
.info img {
  margin: 8px 0 8px 10px;
}
.submit {
  user-select: none;
  margin: 36px auto 0;
  width: 300px;
  height: 40px;
  line-height: 40px;
  font-size: 20px;
  text-align: center;
  background-color: #82bc00;
  color: #fff;
  border-radius: 20px;
  cursor: pointer;
}
.bottomButton {
  width: 100%;
  height: 45px;
  display: inline-block;
  margin-top: 10px;
  text-align: center;
}
.bottomBtn {
  width: 140px;
  height: 22px;
  margin: 0 15px;
  border-radius: 22px;
  padding: 11px 10px;
  cursor: pointer;
  display: inline-block;
  background-color: #eeeeee;
  text-align: center;
  vertical-align: middle;
}
.photoMask {
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.5);
}
.photoMaskContain {
  position: relative;
  top: 50%;
  transform: translateY(-50%); /*偏移*/
  text-align: center;
  vertical-align: center;
}
</style>
<style>
.info .el-input__inner {
  border-radius: 20px;
  background-color: #eeeeee;
}
.info .el-input--prefix .el-input__inner {
  padding-left: 40px;
}
</style>>