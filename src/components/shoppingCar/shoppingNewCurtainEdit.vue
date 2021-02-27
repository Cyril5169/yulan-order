<template>
  <el-card shadow="never">
    <div class="curtain-contain">
      <!-- 帘款 -->
      <div class="curtain-parent-item">
        <span>帘款：{{curtainHeadData.MODEL_NUMBER}}</span>
      </div>
      <!-- 帘款参数 -->
      <div class="curtain-params">
        <!-- 成品宽 -->
        <span>成品宽<span style="color:red;">*</span>：</span>
        <el-input style="width:60px;" size="mini" v-model="curtainHeadData.WIDTH" @input="changeHeadWidth" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>
        <!-- 成品高 -->
        <span style="margin-left:10px;">成品高<span style="color:red;">*</span>：</span>
        <el-input style="width:60px;" size="mini" v-model="curtainHeadData.HEIGHT" @input="changeHeadHeight" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>
        <!-- 暗槽高 -->
        <span style="margin-left:10px;">暗槽高<span style="color:red;">*</span>：</span>
        <el-input style="width:60px;" size="mini" v-model="curtainHeadData.ANCAO_HEIGHT" @input="changeAncaoHeight" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>
        <!-- 活动 -->
        <span style="margin-left:10px;">活动：</span>
        <el-select size="mini" style="width:220px" :disabled="activityOptions.length == 1" v-model="curtainHeadData.ACTIVITY_ID"
          :placeholder="activityOptions.length == 1? '无可选活动': '请选择活动'">
          <el-option v-for="item in activityOptions" :key="item.P_ID"
            :label="item.ORDER_TYPE? item.ORDER_TYPE + ' -- ' + item.ORDER_NAME : item.ORDER_NAME" :value="item.P_ID">
          </el-option>
        </el-select>
        <span style="color:red;font-size:14px;"
          v-if="curtainMsg.activityId === curtainMsg.activityName && curtainMsg.activityEffective != null && !curtainMsg.activityEffective">此活动已经过期，请重新选择</span>
        <!-- 位置 -->
        <span style="margin-left:10px;">位置<span style="color:red;">*</span>：</span>
        <el-input style="width:100px;" v-model="curtainHeadData.LOCATION" size="mini"></el-input>
        <!-- 套数 -->
        <span style="margin-left:10px;">套数<span style="color:red;">*</span>：</span>
        <el-input style="width:50px;" v-model="curtainHeadData.COUNT" size="mini" oninput="value=value.replace(/[^\d]/g,'')">
        </el-input>
      </div>
      <div class="curtain-list">
        <el-table :data="curtainHeadData.curtains" ref="curtainTable" class="curtain-table" border :span-method="cellMerge"
          :row-class-name="tableRowClassName">
          <el-table-column label="预览" width="120" align="center">
            <template slot-scope="scope">
              <!-- 显示图片预览 -->
              <div v-if="scope.$index == 0 && havePicture">
                <img class="curtain-preview" :src="previewUrl" @error="showDefaultImg" />
              </div>
              <span v-else>暂无</span>
            </template>
          </el-table-column>
          <el-table-column label="部件" width="80" header-align="center" prop="NC_PART_TYPECODE">
            <template slot-scope="scope">
              <!-- 树缩进 -->
              <span v-if="scope.row.curtain_level > 0">
                <span :style="{'padding-left': scope.row.curtain_level * 16 + 'px'}"></span>
              </span>
              <span>{{transPartTypeCode(scope.row.NC_PART_TYPECODE)}}</span>
            </template>
          </el-table-column>
          <el-table-column label="编码" width="140" header-align="center" prop="ITEM_NO">
            <template slot-scope="scope">
              <!-- 标定 -->
              <template v-if="scope.row.ITEM_NO">
                <!-- 是否可替换 -->
                <a v-if="itemCanChange(scope.row)" class="a-link" :class="{'delete-cls': !scope.row.curtain_choose}"
                  @click="exchangeModelOrItem(scope.row)">{{scope.row.ITEM_NO}}</a>
                <span v-else :class="{'delete-cls': !scope.row.curtain_choose}">{{scope.row.ITEM_NO}}</span>
                <!-- 是否可删/是否默认勾选 -->
                <el-checkbox v-if="itemCanDelete(scope.row)" v-model="scope.row.curtain_choose"
                  @change="onCheckChange($event, scope.row)"></el-checkbox>
              </template>
              <template v-else-if="scope.row.NC_PART_TYPECODE == 'LBT'">
                <span style="color:red;">未维护数据!</span>
              </template>
              <!-- 没有模板，非标定 -->
              <template v-else>
                <a class="a-link" :class="{'delete-cls': !scope.row.curtain_choose}"
                  @click="exchangeModelOrItem(scope.row)">请选择</a>
                <el-checkbox v-model="scope.row.curtain_choose" @change="onCheckChange($event, scope.row)">
                </el-checkbox>
              </template>
            </template>
          </el-table-column>
          <el-table-column label="名称" width="80" header-align="center" prop="CURTAIN_ITEM_NAME">
          </el-table-column>
          <el-table-column label="制造说明" width="280" header-align="center">
            <template slot-scope="scope">
              <!-- N个配置项逐个检测 -->
              <!-- 宽，高 -->
              <div class="manufacturing-ct" v-if="scope.row.WIDTH_ENABLE > 0 || scope.row.HEIGHT_ENABLE > 0">
                <template v-if="scope.row.WIDTH_ENABLE == 1 || isCheck || isExamine">
                  <span>【宽】: {{ scope.row.WIDTH }}m</span>
                </template>
                <template v-else-if="scope.row.WIDTH_ENABLE == 2">
                  <span>【宽】: <el-input v-model="scope.row.WIDTH" style="width:40px;" size="mini"
                      @input="changeOneWidthOrHeight($event, scope.$index)" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>m
                  </span>
                </template>
                <template v-if="scope.row.HEIGHT_ENABLE == 1 || isCheck || isExamine">
                  <span>【高】: {{ scope.row.HEIGHT }}m</span>
                </template>
                <template v-else-if="scope.row.HEIGHT_ENABLE == 2">
                  <span>【高】: <el-input v-model="scope.row.HEIGHT" style="width:40px;" size="mini"
                      @input="changeOneWidthOrHeight($event, scope.$index)" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>m
                  </span>
                </template>
              </div>
              <!-- 左右转角 -->
              <div class="manufacturing-ct" v-if="scope.row.LEFT_ENABLE > 0 || scope.row.RIGHT_ENABLE > 0">
                <template v-if="scope.row.LEFT_ENABLE == 1 || isCheck || isExamine">
                  <span>【左转角】: {{ scope.row.LEFT_FILLET }}m</span>
                </template>
                <template v-else-if="scope.row.LEFT_ENABLE == 2">
                  <span>【左转角】: <el-input v-model="scope.row.LEFT_FILLET" style="width:40px;" size="mini"
                      @input="changeOneWidthOrHeight($event, scope.$index)" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>m
                  </span>
                </template>
                <template v-if="scope.row.RIGHT_ENABLE == 1 || isCheck || isExamine">
                  <span>【右转角】: {{ scope.row.RIGHT_FILLET }}m</span>
                </template>
                <template v-else-if="scope.row.RIGHT_ENABLE == 2">
                  <span>【右转角】: <el-input v-model="scope.row.RIGHT_FILLET" style="width:40px;" size="mini"
                      @input="changeOneWidthOrHeight($event, scope.$index)" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>m
                  </span>
                </template>
              </div>
              <!-- 么术贴 -->
              <div class="manufacturing-ct" v-if="scope.row.TIE_ENABLE > 0">
                <template v-if="scope.row.TIE_ENABLE == 1 || isCheck || isExamine">
                  <span>【么术贴】: {{ scope.row.MESUTIE | meshutie_filter}}</span>
                </template>
                <template v-else-if="scope.row.TIE_ENABLE == 2">
                  <span>【么术贴】: </span>
                  <el-dropdown trigger="click">
                    <a class="a-userset">{{ scope.row.MESUTIE? scope.row.MESUTIE : '请选择' | meshutie_filter}}</a>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item @click.native="scope.row.MESUTIE = 'ZC'">正车</el-dropdown-item>
                      <el-dropdown-item @click.native="scope.row.MESUTIE = 'FC'">反车</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </template>
              </div>
              <!-- 打开方式 -->
              <div class="manufacturing-ct" v-if="scope.row.KAIKOU_ENABLE > 0">
                <template v-if="scope.row.KAIKOU_ENABLE == 1 || isCheck || isExamine">
                  <span>【打开方式】: {{ scope.row.KAIKOU | kaikou_filter }}</span>
                </template>
                <template v-else-if="scope.row.KAIKOU_ENABLE == 2">
                  <span>【打开方式】: </span>
                  <el-dropdown trigger="click">
                    <a class="a-userset">{{ scope.row.KAIKOU? scope.row.KAIKOU : '请选择' | kaikou_filter}}</a>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item @click.native="scope.row.KAIKOU = 'TK'">对开</el-dropdown-item>
                      <el-dropdown-item @click.native="scope.row.KAIKOU = 'DK'">单开</el-dropdown-item>
                      <el-dropdown-item @click.native="scope.row.KAIKOU = 'SK'">特殊开</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </template>
              </div>
              <!-- 工艺方式 -->
              <div class="manufacturing-ct" v-if="scope.row.OPERATION_ENABLE > 0">
                <template v-if="scope.row.OPERATION_ENABLE == 1 || isCheck || isExamine">
                  <span>【工艺方式】: {{ scope.row.OPERATION | operation_filter }}</span>
                </template>
                <template v-else-if="scope.row.OPERATION_ENABLE == 2">
                  <span>【工艺方式】: </span>
                  <el-dropdown trigger="click">
                    <a class="a-userset">{{ scope.row.OPERATION? scope.row.OPERATION : '请选择' | operation_filter}}</a>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item @click.native="scope.row.OPERATION = 'GDZ'">固定褶</el-dropdown-item>
                      <el-dropdown-item @click.native="scope.row.OPERATION = 'DQ'">打圈</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </template>
              </div>
              <!-- 包边方式 -->
              <div class="manufacturing-ct" v-if="scope.row.BIAN_ENABLE > 0">
                <template v-if="scope.row.BIAN_ENABLE == 1 || isCheck || isExamine">
                  <span>【包边方式】: {{ scope.row.BIAN | bian_filter }}</span>
                </template>
                <template v-else-if="scope.row.BIAN_ENABLE == 2">
                  <span>【包边方式】: </span>
                  <el-dropdown trigger="click" @command="handleBianCommand($event, scope.row)">
                    <a class="a-userset">{{ scope.row.BIAN? scope.row.BIAN : '请选择' | bian_filter}}</a>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item @click.native="scope.row.BIAN = '4B'" command="4B">4S边</el-dropdown-item>
                      <el-dropdown-item @click.native="scope.row.BIAN = '3B'" command="3B">3.0边</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </template>
              </div>
              <!-- 说明 -->
              <div class="manufacturing-ct"
                v-if="scope.row.NCM_NOTE || scope.row.JOINT || scope.row.WRINKLE || scope.row.MAKETYPE ">
                <span>【说明】: <template v-if="scope.row.MAKETYPE">{{scope.row.MAKETYPE | makeType_filter}}<template
                      v-if="scope.row.JOINT || scope.row.WRINKLE || scope.row.MAKETYPE">、</template></template>
                  <template v-if="scope.row.JOINT">{{scope.row.JOINT | joint_filter}}<template
                      v-if="scope.row.WRINKLE || scope.row.MAKETYPE">、</template></template>
                  <template v-if="scope.row.WRINKLE">{{scope.row.WRINKLE }}褶<template
                      v-if="scope.row.MAKETYPE">、</template></template>
                  <template v-if="scope.row.NCM_NOTE">{{scope.row.NCM_NOTE }}</template></span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="用量" width="100" align="center" prop="DOSAGE">
            <template slot-scope="scope">
              <!-- 只有部件显示用量 -->
              <span
                v-if="scope.row.curtain_level == 0 && scope.row.TOTAL_ENABLE == 1 && (isCheck || isExamine)">{{scope.row.DOSAGE}}{{scope.row.UNIT_NAME}}</span>
              <span v-else-if="scope.row.TOTAL_ENABLE == 2 && (!isCheck && !isExamine)">
                <el-input v-model="scope.row.DOSAGE" style="width:40px;" size="mini" @input="changeLSArea($event, scope.$index)"
                  oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>
                {{scope.row.UNIT_NAME}}
              </span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="库存" width="60" align="center" prop="curtain_store"></el-table-column>
          <el-table-column label="单价" width="60" align="center" prop="PRICE" v-if="isManager != '0'">
            <template slot-scope="scope">
              <!-- 只有部件算钱 -->
              <span v-if="scope.row.ITEM_NO && scope.row.curtain_level == 0">{{scope.row.PRICE}}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="折后" width="60" align="center" v-if="isManager != '0'">
            <template slot-scope="scope">
              <!-- 只有部件算钱 -->
              <span v-if="scope.row.ITEM_NO && scope.row.curtain_level == 0">{{ calculatePromotionPrice(scope.row) }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="总价" width="60" align="center" v-if="isManager != '0'">
            <template slot-scope="scope">
              <!-- 只有部件算钱 -->
              <span v-if="scope.row.ITEM_NO && scope.row.curtain_level == 0">{{ oneTotal(scope.row) }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="说明" width="100" header-align="center" prop="ILLUSTRATE">
            <template slot-scope="scope">
              <span style="color:red;font-size:12px;"> {{ scope.row.ILLUSTRATE }}</span>
            </template>
          </el-table-column>
          <el-table-column label="备注" align="center">
            <template slot-scope="scope">
              <span v-if="isCheck || isExamine">{{scope.row.NOTE}}</span>
              <el-input v-else-if="scope.row.ITEM_NO " :disabled="scope.row.KAIKOU != 'SK'" v-model="scope.row.NOTE" size="mini"
                type="textarea" resize="none" :autosize="{ maxRows: 6 }" clearable></el-input>
            </template>
          </el-table-column>
        </el-table>
        <div style="position: relative;">
        <span v-if="isManager != '0'" style="font-size:16px;position:absolute;left: 820px;">
          总计：<span style="color:red;">￥{{ allTotal | dosageFilter }}</span>
        </span>
      </div>
      <div style="text-align:center;margin:20px 0;">
        <el-button type="primary" width="130px" @click="resolveModify">确认修改</el-button>
      </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import Cookies from "js-cookie";
import Axios from "axios";
import { GetPromotionByItem } from "@/api/orderListASP";
import {
  GetAsyncItemData,
  GetPartTypeDataTabale,
  GetCurtainTemplateAndModel,
  GetExchangeModel,
  GetExchangeModelItem,
  AddNewCurtainToCart,
  GetNewCurtainDetail
} from "@/api/newCurtainASP";

export default {
  data() {
    return {
      cid: Cookies.get("cid"), //cid
      customerType: Cookies.get("customerType"), //客户类型
      isManager: Cookies.get("isManager"), //是否为管理员
      curtainMsg: {},
      curtainHeadData: {},
      activityOptions: [],
      curtainPartTypeData: [],
      previewUrl: "",
      drawerShow: false,
      drawerShow2: false,
      exchangeModelList: [],
      exchangeModelTemplate: {},
      exchangeModelNow: {},
      exchangeItemList: [],
      exchangeItemNow: [],
      exchangeItemDefault: {},
      itemCondition: "",
      currentPage: 0,
      limit: 50,
      totalNumber: 0,
      oldCurtainData: [],
      newCurtainData: [],
      havePicture: true
    }
  },
  computed: {
    salPromotion() {
      var selectActivity = this.activityOptions.filter((item) => item.P_ID == this.curtainHeadData.ACTIVITY_ID);
      if (selectActivity.length) {
        return selectActivity[0];
      } else {
        return {};
      }
    },
    allTotal() {
      var totalMoney = 0;
      //找到勾选的
      for (var i = 0; i < this.curtainHeadData.curtains.length; i++) {
        var oneCurtain = this.curtainHeadData.curtains[i];
        if (oneCurtain.curtain_choose == true && oneCurtain.curtain_level == 0) {
          totalMoney = totalMoney.add(this.oneTotal(oneCurtain));
        }
      }
      return totalMoney * this.curtainHeadData.COUNT;
    }
  },
  filters: {
    datatrans(value) {
      //时间戳转化大法
      let date = new Date(value);
      let y = date.getFullYear();
      let MM = date.getMonth() + 1;
      MM = MM < 10 ? "0" + MM : MM;
      let d = date.getDate();
      d = d < 10 ? "0" + d : d;
      let h = date.getHours();
      h = h < 10 ? "0" + h : h;
      let m = date.getMinutes();
      m = m < 10 ? "0" + m : m;
      let s = date.getSeconds();
      s = s < 10 ? "0" + s : s;
      return y + "-" + MM + "-" + d + " " + h + ":" + m + ":" + s;
    },
    transSaleId(value) {
      switch (value) {
        case "A":
          return "销售";
          break;
        case "B":
          return "待淘汰";
          break;
        case "C":
          return "淘汰";
          break;
        case "D":
          return "内留";
          break;
        case "E":
          return "外留";
          break;
        case "F":
          return "永久淘汰";
          break;
      }
    },
    meshutie_filter(value) {
      switch (value) {
        case "ZC":
          return "正车";
          break;
        case "FC":
          return "反车";
          break;
        default:
          return value;
          break;
      }
    },
    kaikou_filter(value) {
      switch (value) {
        case "TK":
          return "对开";
          break;
        case "DK":
          return "单开";
          break;
        case "SK":
          return "特殊开";
          break;
        default:
          return value;
          break;
      }
    },
    operation_filter(value) {
      switch (value) {
        case "GDZ":
          return "固定褶";
          break;
        case "DQ":
          return "打圈";
          break;
        default:
          return value;
          break;
      }
    },
    bian_filter(value) {
      switch (value) {
        case "4B":
          return "4S边";
          break;
        case "3B":
          return "3.0边";
          break;
        default:
          return value;
          break;
      }
    },
    makeType_filter(value) {
      switch (value) {
        case "01":
          return "定宽制作";
          break;
        case "02":
          return "定高制作";
          break;
      }
    },
    joint_filter(value) {
      switch (value) {
        case "SP":
          return "竖拼接";
          break;
        case "HP":
          return "横拼接";
          break;
      }
    },
  },
  methods: {
    //PartType字典
    getPartTypeData() {
      GetPartTypeDataTabale().then((res) => {
        this.curtainPartTypeData = res.data;
      });
    },
    //PartType字典Filter
    transPartTypeCode(val) {
      var name = val;
      var typeCode = this.curtainPartTypeData.filter((item) => item.NC_PART_TYPECODE == val);
      if (typeCode.length) {
        name = typeCode[0].NC_PART_NAME;
      }
      return name;
    },
    //获得活动
    getActivity() {
      this.activityOptions = [];
      GetPromotionByItem(
        {
          cid: this.cid,
          customerType: this.customerType,
          itemNo: this.curtainMsg.modelNumber,
          itemVersion: this.curtainMsg.item.itemVersion,
          productType: this.curtainMsg.item.productType,
          productBrand: this.curtainMsg.item.productBrand,
        },
        { loading: false }
      ).then((res) => {
        console.log(res)
        this.activityOptions = res.data;
        this.activityOptions.push({
          ORDER_TYPE: "",
          ORDER_NAME: "不参与活动",
          P_ID: null,
        });
      });
    },
    getDetail() {
      GetNewCurtainDetail({ cartItemId: this.curtainMsg.cartItemId }).then(res => {
        this.curtainHeadData = res.data;
        console.log(this.curtainHeadData)
        this.dealCurtainData();
        //预览图片
        this.previewUrl = `http://www.luxlano.com/ddkc/ckfinder/userfiles/images/pimg/${this.curtainHeadData.MODEL_NUMBER}.jpg`;
      })
    },
    //处理窗帘数据
    dealCurtainData() {
      var detail = this.curtainHeadData;
      for (var j = 0; j < detail.curtains.length; j++) {
        var oneCurtain = detail.curtains[j];
        //窗帘层级
        var level = 0;
        var NCM_PID = oneCurtain.NCM_PID;
        while (NCM_PID != 0) {
          var temp = detail.curtains.filter((item) => item.NC_MODEL_ID == NCM_PID);
          if (temp.length) {
            NCM_PID = temp[0].NCM_PID;
            level++;
          }
        }
        this.$set(oneCurtain, "curtain_level", level);
        //选中标识
        this.$set(oneCurtain, "curtain_choose", true);
        //库存
        this.$set(oneCurtain, "curtain_store", "");
        //push到olddata中，用来对比
        this.oldCurtainData.push(JSON.parse(JSON.stringify(oneCurtain)))
      }
      detail.curtains = this.getStoreData(detail.curtains);

      //把change的数据也加上各个字段
      for (var j = 0; j < detail.curtain_change.length; j++) {
        var oneCurtain = detail.curtain_change[j];
        //窗帘层级
        var level = 0;
        var NCM_PID = oneCurtain.NCM_PID;
        while (NCM_PID != 0) {
          var temp = detail.curtain_change.filter((item) => item.NC_MODEL_ID == NCM_PID);
          if (temp.length) {
            NCM_PID = temp[0].NCM_PID;
            level++;
          }
        }
        this.$set(oneCurtain, "curtain_level", level);
        //选中标识
        this.$set(oneCurtain, "curtain_choose", true);
        //单价
        var price = this.getPrice(this.cus_customerType, oneCurtain);
        this.$set(oneCurtain, "PRICE", price);
        //宽
        var curtain_width = 0;
        if (oneCurtain.WIDTH_ENABLE > 0) {
          curtain_width = this.dosageFilter(detail.CURTAIN_WIDTH * oneCurtain.NCM_WIDTH_RATIO);
        }
        this.$set(oneCurtain, "curtain_width", curtain_width);
        //高
        var curtain_height = 0;
        if (oneCurtain.HEIGHT_ENABLE > 0) {
          if (oneCurtain.NC_PART_TYPECODE == 'LT') {
            //计算帘头高 帘头的高 =（成品高-暗槽高度）÷0.1*0.0235-0.11 结果保留两位
            curtain_height = this.dosageFilter((detail.CURTAIN_HEIGHT - detail.ANCAO_HEIGHT) * 10 * 0.0235 - 0.11);
          } else {
            curtain_height = this.dosageFilter(detail.CURTAIN_HEIGHT * oneCurtain.NCM_HEIGHT_RATIO);
          }
        }
        //总数（面积）
        var dosage = this.dosageFilter(curtain_width * curtain_height);
        if (oneCurtain.NC_PART_TYPECODE == "GBD") dosage = 1; //挂绑带默认为1
        this.$set(oneCurtain, "DOSAGE", dosage);
        if (oneCurtain.NC_PART_TYPECODE == "LS") {
          //改变里衬布的
          var LCBITEM = detail.curtain_change.filter((item) => item.NC_PART_TYPECODE == "LCB");
          for (var k = 0; k < LCBITEM.length; k++) {
            //假设有多个里衬布的情况
            LCBITEM[k].DOSAGE = dosage;
          }
        }
        //左转角
        this.$set(oneCurtain, "LEFT_FILLET", 0);
        //右转角
        this.$set(oneCurtain, "RIGHT_FILLET", 0);
        //库存
        this.$set(oneCurtain, "curtain_store", "");
        //客户备注
        this.$set(oneCurtain, "curtain_note", "");
        //说明
        this.$set(oneCurtain, "ILLUSTRATE", "");
      }
      detail.curtain_change = this.getStoreData(detail.curtain_change);
    },
    //查找库存
    getStoreData(originData) {
      for (var i = 0; i < originData.length; i++) {
        var oneCurtain = originData[i];
        if (!oneCurtain.ITEM_NO) continue;
        //库存
        var postData = {
          token: "兰居尚品",
          code: oneCurtain.ITEM_NO,
        };
        Axios.post("http://ljsp.ubxiu.com:8098/api/getXXDMX", postData, {
          params: postData,
          loading: false,
        }).then((res) => {
          if (res.data && res.data.data) {
            var store_charge = "";
            if (res.data.data.kucun == null || res.data.data.dinghuoshu == null
              || res.data.data.ddz == null || res.data.data.xiaxian == null)
              return;
            var store_num = res.data.data.kucun - res.data.data.dinghuoshu - res.data.data.ddz;
            var xiaxian = res.data.data.xiaxian;
            if (store_num >= xiaxian) {
              store_charge = "充足"
            } else if (store_num > 0 && store_num < xiaxian) {
              store_charge = "量少待查";
            } else if (store_num < 0) {
              store_charge = "欠料待审";
            }
            var data = originData.filter((item) => item.ITEM_NO == res.data.data.code);
            if (data.length) {
              for (var j = 0; j < data.length; j++) {
                data[j].curtain_store = store_charge;
              }
            }
          }
        }).catch(res => { });
      }
      return originData;
    },
    //根据客户类型获取价格
    getPrice(type, item) {
      var price = 0;
      //只有第一级需要计算价格
      if (item && item.curtain_level == 0) {
        if (type == "02" || type == "08" || type == "10") {
          //经销
          price = item.PRICE_SALE;
        } else if (type == "05") {
          price = item.SALE_PRICE;
        } else if (type == "06") {
          price = item.PRICE_FX;
        } else if (type == "09") {
          price = item.PRICE_HOME;
        }
      }
      return price;
    },
    //转换数字
    convertNumber(val) {
      if (typeof val === 'number' && !isNaN(val)) return val;
      if (typeof val === 'string') {
        if (Number(val) != NaN) return Number(val);
      }
      return 0;
    },
    //改变成品宽
    changeHeadWidth(val) {
      for (var i = 0; i < this.curtainHeadData.curtains.length; i++) {
        var oneCurtain = this.curtainHeadData.curtains[i];
        if (oneCurtain.WIDTH_ENABLE > 0) {
          var width = this.convertNumber(this.curtainHeadData.width);
          oneCurtain.curtain_width = this.dosageFilter(width * oneCurtain.NCM_WIDTH_RATIO);
          this.changeOneWidthOrHeight(val, i);
        }
      }
    },
    //改变成品高
    changeHeadHeight(val) {
      for (var i = 0; i < this.curtainHeadData.curtains.length; i++) {
        var oneCurtain = this.curtainHeadData.curtains[i];
        if (oneCurtain.HEIGHT_ENABLE > 0) {
          var height = this.convertNumber(this.curtainHeadData.height);
          var ancaoHeight = this.convertNumber(this.curtainHeadData.ancaoHeight);
          if (oneCurtain.NC_PART_TYPECODE == 'LT') {
            //计算帘头高 帘头的高 =（成品高-暗槽高度）÷0.1*0.0235-0.11 结果保留两位
            oneCurtain.curtain_height = this.dosageFilter((height - ancaoHeight) * 10 * 0.0235 - 0.11);
          } else {
            oneCurtain.curtain_height = this.dosageFilter(height * oneCurtain.NCM_HEIGHT_RATIO);
          }
          this.changeOneWidthOrHeight(val, i);
        }
      }
    },
    //改变暗槽高
    changeAncaoHeight(val) {
      for (var i = 0; i < this.curtainHeadData.curtains.length; i++) {
        var oneCurtain = this.curtainHeadData.curtains[i];
        if (oneCurtain.NC_PART_TYPECODE == 'LT') {
          var height = this.convertNumber(this.curtainHeadData.height);
          var ancaoHeight = this.convertNumber(this.curtainHeadData.ancaoHeight);
          //计算帘头高 帘头的高 =（成品高-暗槽高度）÷0.1*0.0235-0.11 结果保留两位
          oneCurtain.curtain_height = this.dosageFilter((height - ancaoHeight) * 10 * 0.0235 - 0.11);
          this.changeOneWidthOrHeight(val, i);
        }
      }
    },
    //改变单个宽或者高或左右转角
    changeOneWidthOrHeight(val, index) {
      var oneCurtain = this.curtainHeadData.curtains[index];
      var curtain_width = this.convertNumber(oneCurtain.curtain_width);
      var curtain_height = this.convertNumber(oneCurtain.curtain_height);
      var LEFT_FILLET = this.convertNumber(oneCurtain.LEFT_FILLET);
      var RIGHT_FILLET = this.convertNumber(oneCurtain.RIGHT_FILLET);
      if (oneCurtain.NC_PART_TYPECODE == "LT") {
        //计算帘头用量 帘头用量=（帘头宽+左转角+右转角）*帘头高
        oneCurtain.DOSAGE = this.dosageFilter((curtain_width + LEFT_FILLET + RIGHT_FILLET) * curtain_height);
      } else {
        oneCurtain.DOSAGE = this.dosageFilter(curtain_width * curtain_height);
      }
      //帘身改变同时改变里衬布的
      if (oneCurtain.NC_PART_TYPECODE == "LS") {
        //改变里衬布的
        var LCBITEM = this.curtainHeadData.curtains.filter((item) => item.NC_PART_TYPECODE == "LCB");
        for (var i = 0; i < LCBITEM.length; i++) {
          //假设有多个里衬布的情况
          LCBITEM[i].DOSAGE = oneCurtain.DOSAGE;
        }
      }
      this.getRemark(index);
    },
    //直接改变帘身用量
    changeLSArea(val, index) {
      var oneCurtain = this.curtainHeadData.curtains[index];
      if (oneCurtain.NC_PART_TYPECODE == "LS") {
        //改变里衬布的
        var LCBITEM = this.curtainHeadData.curtains.filter((item) => item.NC_PART_TYPECODE == "LCB");
        for (var i = 0; i < LCBITEM.length; i++) {
          //假设有多个里衬布的情况
          LCBITEM[i].DOSAGE = oneCurtain.DOSAGE;
        }
      }
      this.getRemark(index);
    },
    //计算折后价格
    calculatePromotionPrice(data) {
      var price = 0;
      if (data && data.PRICE) {
        //首先判断TYPE,1折扣，2定价
        if (this.salPromotion && this.salPromotion.P_ID) {
          switch (this.salPromotion.TYPE) {
            case "1":
              //折扣
              price = data.PRICE.mul(this.salPromotion.DISCOUNT);
              break;
            case "2":
              //定价
              price = this.salPromotion.PRICE;
          }
        } else {
          price = data.PRICE;
        }
      }
      return this.dosageFilter(price);
    },
    //一个子件的总价
    oneTotal(row, calculatePromotion = true) {
      var price = 0;
      if (row.DOSAGE) {
        price = calculatePromotion ? this.calculatePromotionPrice(row) : row.PRICE;
        //最小下单量 帘头1.帘身，窗纱4
        var DOSAGE = this.convertNumber(row.DOSAGE);
        if (row.NC_PART_TYPECODE == 'LT' && DOSAGE < 1) {
          DOSAGE = 1;
        } else if ((row.NC_PART_TYPECODE == 'LS' || row.NC_PART_TYPECODE == 'CS') && DOSAGE < 4) {
          DOSAGE = 4;
        }
        price = price.mul(DOSAGE)
      }
      return price;
    },
    //处理拉边条
    handleBianCommand(common, row) {
      if (common == "4B" && row.BIAN != "4B") {
        //显示拉边条
        //先看看当前数据有没有这个拉边条，有的话应该是bug
        var lbtItemNow = this.curtainHeadData.curtains.filter((item) => item.NCM_PID == row.NC_MODEL_ID && item.NC_PART_TYPECODE == "LBT");
        if (lbtItemNow.length) return;
        //找到最大序号的面料,并且是要勾选的
        var mlList = this.curtainHeadData.curtains.filter(
          (item) =>
            item.NCM_PID == row.NC_MODEL_ID &&
            item.NC_PART_TYPECODE != "LBT" &&
            item.curtain_choose
        );
        if (mlList.length) {
          //在修改后的数据中找到拉边条数据并push进去
          var lbtItem = this.curtainHeadData.curtain_change.filter((item) => item.NCM_PID == row.NC_MODEL_ID && item.NC_PART_TYPECODE == "LBT");
          if (lbtItem.length) {
            lbtItem = lbtItem[0]; //只取第一个拉边条（按理应该只有一个）
            this.curtainHeadData.curtains.push({ ...lbtItem });
            //强制改成对应的ITEM_NO
            this.curtainHeadData.curtains[this.curtainHeadData.curtains.length - 1].ITEM_NO = mlList[mlList.length - 1].MATERIAL_NO;
            //排序
            this.curtainHeadData.curtains.sort((a, b) => {
              if (a.NCT_SORTNO == b.NCT_SORTNO) {
                return a.NCM_SORTNO > b.NCM_SORTNO ? 1 : -1;
              }
              return a.NCT_SORTNO > b.NCT_SORTNO ? 1 : -1;
            });
          }
        }
      } else if (common == "3B" && row.BIAN == "4B") {
        //去掉拉边条
        //找到有没有拉边条
        var lbtItem = this.curtainHeadData.curtains.filter((item) => item.NCM_PID == row.NC_MODEL_ID && item.NC_PART_TYPECODE == "LBT");
        //应该只有一个拉边条，但是循环一下，保险
        for (var i = 0; i < lbtItem.length; i++) {
          this.curtainHeadData.curtains.splice(this.curtainHeadData.curtains.indexOf(lbtItem[i]), 1);
        }
      }
    },
    //是否可改
    itemCanChange(row) {
      var canChange = true;
      if (row.curtain_level == 0) {
        canChange = row.NCT_CHANGE == 1;
      } else {
        canChange = row.NCT_CHANGE == 1 && row.NCM_CHANGE == 1;
      }
      return canChange;
    },
    //是否可删
    itemCanDelete(row) {
      var canDelete = true;
      if (row.curtain_level == 0) {
        canDelete = row.NCT_DELETE > 0;
      } else {
        canDelete = row.NCT_DELETE > 0 && row.NCM_DELETE > 0;
      }
      return canDelete;
    },
    //显示默认图片
    showDefaultImg(e) {
      this.havePicture = false;
    },
    //合并第一列显示预览
    cellMerge({ row, column, rowIndex, columnIndex }) {
      if (columnIndex == 0) {
        if (rowIndex == 0) {
          return {
            rowspan: this.curtainHeadData.curtains.length,
            colspan: 1,
          };
        } else {
          return {
            rowspan: 0,
            colspan: 0,
          };
        }
      }
    },
    tableRowClassName({ row, rowIndex }) {
      if (row.curtain_level == 0) {
        if (!row.curtain_choose) return 'bold-row delete-row-cls';
        else return 'bold-row';
      } else {
        if (!row.curtain_choose) return 'fade-row delete-row-cls';
        else return 'fade-row';
      }
      return '';
    }
  },
  created() {
    this.curtainMsg = this.$route.params.curtain;
    console.log(this.curtainMsg)
    if (!this.curtainMsg || (this.curtainMsg && !this.curtainMsg.cartItemId)) {
      return;
    }
    this.getPartTypeData();
    this.getActivity();
    this.getDetail();
  }
}
</script>

<style scoped>
.curtain-contain {
  margin-top: 10px;
  padding: 5px 0;
  border: 1px solid #eee;
}
.curtain-parent-item {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
}
.curtain-params {
  text-align: center;
  margin-top: 5px;
}
.curtain-list {
  margin-top: 10px;
}
.curtain-preview {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
}
.a-link {
  text-decoration: underline;
}
.a-userset {
  color: #409eff;
  background: 0 0;
  text-decoration: none;
  outline: 0;
  transition: color 0.2s ease;
}
.delete-cls {
  color: tomato;
  text-decoration: line-through;
  cursor: unset;
}
.manufacturing-ct {
  margin-bottom: 0;
}
.no-data {
  width: 100%;
  height: 500px;
  text-align: center;
  line-height: 500px;
  font-size: 20px;
}
.model-exchange-list {
  position: relative;
  width: 100%;
  height: calc(100% - 30px);
  overflow-x: hidden;
  overflow-y: auto;
}
.model-exchange-list-ct {
  position: absolute;
}
.model-exchange-ct {
  display: inline-block;
  padding: 5px;
  margin: 5px 10px;
  background: #eee;
  border: 1px solid #eee;
  cursor: pointer;
  box-sizing: border-box;
}
.model-exchange-ct:hover {
  border: 1px solid #409eff;
}
.model-exchange-now {
  background: #409eff;
}
.model-exchange-inner {
  background-color: white;
  display: flex;
  position: relative;
}
.default-model-label {
  padding: 2px;
  background-color: #8bc34a;
  color: white;
  font-size: 12px;
  text-align: center;
  writing-mode: tb;
}
.index-badge {
  position: absolute;
  left: 1px;
  top: 3px;
}
.item-exchange-list {
  position: relative;
  width: 100%;
  height: calc(100% - 90px);
  overflow-x: hidden;
  overflow-y: auto;
}
.item-exchange-list-ct {
  position: absolute;
}
.item-exchange-ct {
  padding: 8px 10px 0 10px;
  margin: 5px;
  border-radius: 3px;
  height: 32px;
  border: 1px solid #dcdfe6;
  display: inline-block;
  cursor: pointer;
}
.item-exchange-ct:hover {
  border: 1px solid #000;
}
.item-exchange-now {
  background: #409eff;
}
.item-exchange-now:hover {
  border: 1px solid #dcdfe6;
}
.default-item-label {
  padding: 2px;
  background-color: #8bc34a;
  color: white;
  font-size: 12px;
  text-align: center;
}
</style>
<style>
.curtain-list .el-table td,
.curtain-list .el-table th {
  padding: 1px 0 !important;
}
.curtain-list .el-table .cell {
  padding: 0 2px !important;
}
.curtain-list .el-input__inner {
  padding: 0 5px !important;
  height: 20px !important;
}
.index-badge .el-badge__content {
  background: gray;
}
.curtain-list .el-table .bold-row {
  font-weight: bold;
}
.curtain-list .el-table .fade-row {
  color: #b0b4bb;
}
.curtain-list .el-table .delete-row-cls {
  color: tomato;
  text-decoration: line-through;
  cursor: unset;
}
</style>
