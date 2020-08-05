<template>
  <div class="stydyCenter">
    <header>
      <h2 class="studyTitle">{{ selectData.TITLE }}</h2>
    </header>
    <header>
      <h2 class="studySubTitle">
        {{ selectData.DESCP }}
      </h2>
    </header>
    <div class="studyContent">
      <!-- 循环组 -->
      <el-card shadow="hover" v-for="group in studyContextData" :key="group.ORDERINDEX">
        <div v-if="studyContextData.length > 1" slot="header">
          <span class="fstrong f16">{{ group.TITLE }} [{{ group.QUESTIONCOUNT }}]</span>
        </div>
        <!-- 循环问题 -->
        <div class="controllerItem" v-for="context in group.contextList" :key="context.SID">
          <div class="questionItem">
            <h2 class="questionTitle">
              {{ context.ORDERINDEX }}.{{ context.TITLE }}
            </h2>
            <!-- 分类加载答案 -->
            <!-- 标准5项 -->
            <div class="optionClass" v-if="context.TYPE == 'STAND_5_SINGLE'">
              <el-radio-group v-model="context.optionResultValue">
                <el-radio class="optionSingle" :label="index + 1" v-for="(option, index) in context.optionList"
                  :key="index" :disabled="checkType">{{ option.OPTIONTEXT }}</el-radio>
              </el-radio-group>
            </div>
            <!-- 标准6分量化 -->
            <div class="optionClass" v-else-if="context.TYPE == 'STAND_6_SINGLE'">
              <span style="display:inline-block;margin-right:10px;">{{
                context.OPTIONTEXT1
              }}</span>
              <span style="display:inline-block;">
                <el-rate class="optionSingle" v-model="context.optionResultValue" :colors="colors" :max="6"
                  :disabled="checkType">
                </el-rate>
              </span>
              <span style="display:inline-block;">{{
                context.OPTIONTEXT6
              }}</span>
            </div>
            <!-- 自定义单选 -->
            <div class="optionClass" v-else-if="context.TYPE == 'CUSTM_SINGLE'">
              <el-radio-group v-model="context.optionResultValue">
                <div class="optionSingle" :style="{
                    display:
                      context.DIPLAYTYPE == 'VERTICAL'
                        ? 'block'
                        : 'inline-block'
                  }" v-for="(option, index) in context.optionList" :key="index">
                  <el-radio :label="index + 1" @change="radioChange(context)" :disabled="checkType">
                    <template v-if="
                        context.LASTOPTIONEEDINPUT == 1 &&
                          index == context.optionList.length - 1
                      ">{{ option.OPTIONTEXT }}
                      <el-input style="margin-left:5px;" :disabled="context.optionResultValue != index + 1 && checkType"
                        v-model="context.optionExtraValue"></el-input>
                    </template>
                    <span v-else>{{ option.OPTIONTEXT }}</span></el-radio>
                </div>
              </el-radio-group>
            </div>
            <!-- 自定义多选 -->
            <div class="optionClass" v-else-if="context.TYPE == 'CUSTM_MULTIP'">
              <el-checkbox-group v-model="context.optionResultValue">
                <div class="optionSingle" :style="{
                    display:
                      context.DIPLAYTYPE == 'VERTICAL'
                        ? 'block'
                        : 'inline-block'
                  }" v-for="(option, index) in context.optionList" :key="index">
                  <el-checkbox :label="index + 1" @change="radioChange2(context)" :disabled="checkType">
                    <template v-if="
                        context.LASTOPTIONEEDINPUT == 1 &&
                          index == context.optionList.length - 1
                      ">{{ option.OPTIONTEXT }}
                      <el-input style="margin-left:5px;" :disabled="
                          context.optionResultValue.indexOf(index + 1) == -1 && checkType
                        " v-model="context.optionExtraValue"></el-input>
                    </template>
                    <span v-else>{{ option.OPTIONTEXT }}</span></el-checkbox>
                </div>
              </el-checkbox-group>
            </div>
            <!-- 短填空 -->
            <div class="optionClass" v-else-if="context.TYPE == 'SHORT_INPUT'">
              <el-input class="optionSingle" style="width:15%;" v-model="context.optionResultValue"
                :disabled="checkType"></el-input>
            </div>
            <!-- 长填空 -->
            <div class="optionClass" v-else-if="context.TYPE == 'LONG_INPUT'">
              <el-input class="optionSingle" type="textarea" style="width:50%;" :autosize="{ minRows: 3, maxRow: 4 }"
                resize="none" v-model="context.optionResultValue" :disabled="checkType"></el-input>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import {
  GetGroupContextOption,
  BeginEditStudy,
  SubmitStudy,
} from "@/api/studyASP";
import Cookies from "js-cookie";

export default {
  data() {
    return {
      studyContextData: [],
      colors: ["#99A9BF", "#F7BA2A", "#FF9900"],
    };
  },
  props: {
    selectData: {
      type: Object,
      default: null,
    },
    checkType: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    radioChange(context) {
      if (
        context.LASTOPTIONEEDINPUT == 1 &&
        context.optionResultValue != context.OPTIONNUM &&
        context.optionExtraValue
      ) {
        context.optionExtraValue = "";
      }
    },
    radioChange2(context) {
      if (
        context.LASTOPTIONEEDINPUT == 1 &&
        context.optionResultValue.indexOf(context.OPTIONNUM) == -1 &&
        context.optionExtraValue
      ) {
        context.optionExtraValue = "";
      }
    },
    editStudy() {
      this.studyContextData = [];
      if(!this.checkType) BeginEditStudy({ cid: Cookies.get("cid"), sfid: this.selectData.SID });
      GetGroupContextOption({
        sfid: this.selectData.SID,
        cid: Cookies.get("cid"),
      }).then((res) => {
        this.studyContextData = res.data;
        for (var i = 0; i < this.studyContextData.length; i++) {
          for (
            var j = 0;
            j < this.studyContextData[i].contextList.length;
            j++
          ) {
            if (
              this.studyContextData[i].contextList[j].optionResultValue &&
              this.studyContextData[i].contextList[j].TYPE != "SHORT_INPUT" &&
              this.studyContextData[i].contextList[j].TYPE != "LONG_INPUT"
            ) {
              if (
                this.studyContextData[i].contextList[
                  j
                ].optionResultValue.indexOf(",") > -1
              ) {
                //多选
                var temp = [];
                this.studyContextData[i].contextList[
                  j
                ].optionResultValue = this.studyContextData[i].contextList[
                  j
                ].optionResultValue.split(",");
                for (
                  var s = 0;
                  s <
                  this.studyContextData[i].contextList[j].optionResultValue
                    .length;
                  s++
                ) {
                  this.studyContextData[i].contextList[j].optionResultValue[
                    s
                  ] = Number(
                    this.studyContextData[i].contextList[j].optionResultValue[s]
                  );
                }
              } else {
                this.studyContextData[i].contextList[
                  j
                ].optionResultValue = Number(
                  this.studyContextData[i].contextList[j].optionResultValue
                );
              }
            }
            if (
              this.studyContextData[i].contextList[j].TYPE ==
                "STAND_6_SINGLE" &&
              !this.studyContextData[i].contextList[j].optionResultValue
            )
              this.studyContextData[i].contextList[j].optionResultValue = 0;
            else if (
              this.studyContextData[i].contextList[j].TYPE == "CUSTM_MULTIP" &&
              !this.studyContextData[i].contextList[j].optionResultValue
            )
              this.studyContextData[i].contextList[j].optionResultValue = [];
          }
        }
        //this.detailVisible = true;
      });
    },
    submitStudy() {
      var finalResult = [];
      for (var i = 0; i < this.studyContextData.length; i++) {
        for (var j = 0; j < this.studyContextData[i].contextList.length; j++) {
          var context = this.studyContextData[i].contextList[j];
          if (
            !context.optionResultValue ||
            context.optionResultValue.length == 0
          ) {
            if (this.studyContextData.length == 1) {
              this.$alert("第" + (j + 1) + "题没有填写", "提示", {
                type: "warning",
                confirmButtonText: "好的",
              });
            } else {
              this.$alert(
                "第" + (i + 1) + "组第" + (j + 1) + "题没有填写",
                "提示",
                {
                  type: "warning",
                  confirmButtonText: "好的",
                }
              );
            }
            return;
          } else {
            if (
              context.LASTOPTIONEEDINPUT == 1 &&
              (context.optionResultValue == context.OPTIONNUM ||
                (context.TYPE === "CUSTM_MULTIP" &&
                  context.optionResultValue.indexOf(context.OPTIONNUM) > -1)) &&
              !context.optionExtraValue
            ) {
              if (this.studyContextData.length == 1) {
                this.$alert("第" + (j + 1) + "题没有填写完整", "提示", {
                  type: "warning",
                  confirmButtonText: "好的",
                });
              } else {
                this.$alert(
                  "第" + (i + 1) + "组第" + (j + 1) + "题没有填写完整",
                  "提示",
                  {
                    type: "warning",
                    confirmButtonText: "好的",
                  }
                );
              }
              return;
            }
          }
          var option = "";
          if (context.TYPE === "CUSTM_MULTIP") {
            option =
              context.optionResultValue.join(",") +
              (context.optionExtraValue
                ? "_;_" + context.optionExtraValue
                : "");
          } else {
            option =
              context.optionResultValue +
              (context.optionExtraValue
                ? "_;_" + context.optionExtraValue
                : "");
          }
          finalResult.push({
            sid: context.SID,
            option: option,
          });
        }
      }
      SubmitStudy({
        resultValue: finalResult,
        cid: Cookies.get("cid"),
        sfid: this.selectData.SID,
      }).then((res) => {
        this.$emit("refresh"); //触发父组件刷新
      });
    },
  },
  activated() {
    this.editStudy();
  },
};
</script>

<style scoped>
.studyTitle {
  margin: 0 0 20px 0;
  text-align: center;
  font-size: 30px;
  color: #555;
}
.studySubTitle {
  margin: 0 0 20px 0;
  margin-left: 30px;
  margin-right: 30px;
  text-indent: 32px;
  font-size: 16px;
  color: #555;
}
.studyContent {
  padding: 10px 0;
  border-top: 2px solid #ccc;
  border-bottom: 2px solid #ccc;
}
.questionTitle {
  margin: 0;
  padding: 15px 20px;
  font-size: 20px;
  color: #555;
}
.optionClass {
  margin-left: 40px;
}
.optionSingle {
  margin-bottom: 10px;
  margin-right: 10px;
  font-size: 15px;
}
.questionItem {
  padding: 0;
}
.controllerItem {
  border-bottom: 1px dashed #ccc;
}
.controllerItem :hover {
  background-color: #fafafa;
}
</style>
<style>
.studyContent .el-card__body {
  padding: 0;
}
.studyMain .el-dialog__header {
  padding: 0;
}
</style>