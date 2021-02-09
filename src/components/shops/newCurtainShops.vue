<template>
  <el-card shadow="never">
    <div>
      <el-autocomplete :trigger-on-focus="false" clearable v-model.trim="searchKey"
        :fetch-suggestions="querySearchAsync" @select="searchCurtain" @clear="searchCurtain"
        @keyup.enter.native="searchCurtain" placeholder="请输入帘款查找窗帘" style="width:300px;">
        <el-button @click="searchCurtain" slot="append" icon="el-icon-search">搜索</el-button>
      </el-autocomplete>
    </div>
    <div style="min-height:500px;">
      <div class="curtain-contain" v-if="!noData && curtainHeadData && curtainHeadData.ITEM_NO">
        <!-- 帘款 -->
        <div class="curtain-parent-item">
          <span>帘款：{{curtainHeadData.ITEM_NO}}</span>
        </div>
        <!-- 帘款参数 -->
        <div class="curtain-params">
          <span>成品宽：</span>
          <el-input style="width:60px;" size="mini" v-model="curtainHeadData.width" @input="changeHeadWidth" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>
          <span style="margin-left:20px;">成品高：</span>
          <el-input style="width:60px;" size="mini" v-model="curtainHeadData.height" @input="changeHeadHeight" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>
          <span style="margin-left:20px;">活动：</span>
          <el-select size="mini" style="width:220px" :disabled="activityOptions.length == 1"
            v-model="curtainHeadData.activityId" :placeholder="activityOptions.length == 1? '无可选活动': '请选择活动'">
            <el-option v-for="item in activityOptions" :key="item.P_ID"
              :label="item.ORDER_TYPE? item.ORDER_TYPE + ' -- ' + item.ORDER_NAME : item.ORDER_NAME" :value="item.P_ID">
            </el-option>
          </el-select>
          <span style="margin-left:20px;">位置：</span>
          <el-input style="width:80px;" v-model="curtainHeadData.location" size="mini"></el-input>
          <span style="margin-left:20px;">套数：</span>
          <el-input style="width:50px;" v-model="curtainHeadData.setNum" size="mini"
            oninput="value=value.replace(/[^\d]/g,'')"></el-input>
        </div>
        <!-- 窗帘部件 -->
        <div class="curtain-list">
          <el-table :data="curtainData" ref="curtainTable" class="curtain-table" border :span-method="cellMerge">
            <el-table-column label="预览" width="140" align="center">
              <template slot-scope="scope">
                <!-- 显示图片预览 -->
                <div v-if="scope.$index == 0">
                  <img class="curtain-preview" :src="previewUrl" @error="showDefaultImg" />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="部件" width="80" header-align="center" prop="NC_PART_TYPECODE">
              <template slot-scope="scope">
                <!-- 树缩进 -->
                <span v-if="scope.row.curtain_level > 0">
                  <span :style="{'padding-left': scope.row.curtain_level * 16 + 'px'}"></span>
                </span>
                <span :class="{'delete-cls': !scope.row.curtain_choose}"
                  :style="{'font-weight': scope.row.curtain_level==0?'bold':''}">{{transPartTypeCode(scope.row.NC_PART_TYPECODE)}}</span>
              </template>
            </el-table-column>
            <el-table-column label="编码" width="170" header-align="center" prop="ITEM_NO">
              <template slot-scope="scope">
                <template v-if="scope.row.ITEM_NO">
                  <!-- 是否可替换 -->
                  <a v-if="scope.row.NCT_CHANGE == 1 && scope.row.NCM_CHANGE == 1" class="a-link"
                    :class="{'delete-cls': !scope.row.curtain_choose}"
                    @click="exchangeModelOrItem(scope.row)">{{scope.row.ITEM_NO}}</a>
                  <span v-else :class="{'delete-cls': !scope.row.curtain_choose}">{{scope.row.ITEM_NO}}</span>
                  <!-- 是否可删/是否默认勾选 -->
                  <el-checkbox v-if="scope.row.NCT_DELETE > 0 && scope.row.NCM_DELETE > 0"
                    v-model="scope.row.curtain_choose" @change="onCheckChange($event, scope.row)"></el-checkbox>
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
            <el-table-column label="名称" width="80" header-align="center" prop="NOTE">
            </el-table-column>
            <el-table-column label="制造说明" width="280" header-align="center">
              <template slot-scope="scope">
                <!-- N个配置项逐个检测 -->
                <!-- 宽，高 -->
                <div class="manufacturing-ct" v-if="scope.row.WIDTH_ENABLE > 0 || scope.row.HEIGHT_ENABLE > 0">
                  <template v-if="scope.row.WIDTH_ENABLE == 1">
                    <span>【宽】: {{ scope.row.curtain_width }}m</span>
                  </template>
                  <template v-if="scope.row.WIDTH_ENABLE == 2">
                    <span>【宽】: <el-input v-model="scope.row.curtain_width" style="width:40px;" size="mini"
                        @input="changeOneWidthOrHeight($event, scope.$index)" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>m
                    </span>
                  </template>
                  <template v-if="scope.row.HEIGHT_ENABLE == 1">
                    <span>【高】: {{ scope.row.curtain_height }}m</span>
                  </template>
                  <template v-if="scope.row.HEIGHT_ENABLE == 2">
                    <span>【高】: <el-input v-model="scope.row.curtain_height" style="width:40px;" size="mini"
                        @input="changeOneWidthOrHeight($event, scope.$index)" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>m
                    </span>
                  </template>
                </div>
                <!-- 左右圆角 -->
                <div class="manufacturing-ct" v-if="scope.row.LEFT_ENABLE > 0 || scope.row.RIGHT_ENABLE > 0">
                  <template v-if="scope.row.LEFT_ENABLE == 1">
                    <span>【左转角】: {{ scope.row.curtain_left_filet }}m</span>
                  </template>
                  <template v-if="scope.row.LEFT_ENABLE == 2">
                    <span>【左转角】: <el-input v-model="scope.row.curtain_left_filet" style="width:40px;" size="mini"
                        @input="changeOneWidthOrHeight($event, scope.$index)" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>m
                    </span>
                  </template>
                  <template v-if="scope.row.RIGHT_ENABLE == 1">
                    <span>【右转角】: {{ scope.row.curtain_right_filet }}m</span>
                  </template>
                  <template v-if="scope.row.RIGHT_ENABLE == 2">
                    <span>【右转角】: <el-input v-model="scope.row.curtain_right_filet" style="width:40px;" size="mini"
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
                  <template v-if="scope.row.TIE_ENABLE == 1">
                    <span>【么术贴】: {{ scope.row.NCM_MESUTIE | meshutie_filter}}</span>
                  </template>
                  <template v-if="scope.row.TIE_ENABLE == 2">
                    <span>【么术贴】: </span>
                    <el-dropdown trigger="click">
                      <a
                        class="a-userset">{{ scope.row.NCM_MESUTIE? scope.row.NCM_MESUTIE : '请选择' | meshutie_filter}}</a>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item @click.native="scope.row.NCM_MESUTIE = 'ZC'">正车</el-dropdown-item>
                        <el-dropdown-item @click.native="scope.row.NCM_MESUTIE = 'FC'">反车</el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                  </template>
                </div>
                <!-- 打开方式 -->
                <div class="manufacturing-ct" v-if="scope.row.KAIKOU_ENABLE > 0">
                  <template v-if="scope.row.KAIKOU_ENABLE == 1">
                    <span>【打开方式】: {{ scope.row.NCM_KAIKOU | kaikou_filter }}</span>
                  </template>
                  <template v-if="scope.row.KAIKOU_ENABLE == 2">
                    <span>【打开方式】: </span>
                    <el-dropdown trigger="click">
                      <a class="a-userset">{{ scope.row.NCM_KAIKOU? scope.row.NCM_KAIKOU : '请选择' | kaikou_filter}}</a>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item @click.native="scope.row.NCM_KAIKOU = 'TK'">对开</el-dropdown-item>
                        <el-dropdown-item @click.native="scope.row.NCM_KAIKOU = 'DK'">单开</el-dropdown-item>
                        <el-dropdown-item @click.native="scope.row.NCM_KAIKOU = 'SK'">特殊开</el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                  </template>
                </div>
                <!-- 工艺方式 -->
                <div class="manufacturing-ct" v-if="scope.row.OPERATION_ENABLE > 0">
                  <template v-if="scope.row.OPERATION_ENABLE == 1">
                    <span>【工艺方式】: {{ scope.row.NCM_OPERATION | operation_filter }}</span>
                  </template>
                  <template v-if="scope.row.OPERATION_ENABLE == 2">
                    <span>【工艺方式】: </span>
                    <el-dropdown trigger="click">
                      <a
                        class="a-userset">{{ scope.row.NCM_OPERATION? scope.row.NCM_OPERATION : '请选择' | operation_filter}}</a>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item @click.native="scope.row.NCM_OPERATION = 'GDZ'">固定褶</el-dropdown-item>
                        <el-dropdown-item @click.native="scope.row.NCM_OPERATION = 'DQ'">打圈</el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                  </template>
                </div>
                <!-- 包边方式 -->
                <div class="manufacturing-ct" v-if="scope.row.BIAN_ENABLE > 0">
                  <template v-if="scope.row.BIAN_ENABLE == 1">
                    <span>【包边方式】: {{ scope.row.NCM_BIAN | bian_filter }}</span>
                  </template>
                  <template v-if="scope.row.BIAN_ENABLE == 2">
                    <span>【包边方式】: </span>
                    <el-dropdown trigger="click" @command="handleBianCommand($event, scope.row)">
                      <a class="a-userset">{{ scope.row.NCM_BIAN? scope.row.NCM_BIAN : '请选择' | bian_filter}}</a>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item @click.native="scope.row.NCM_BIAN = '4B'" command="4B">4S边</el-dropdown-item>
                        <el-dropdown-item @click.native="scope.row.NCM_BIAN = '3B'" command="3B">3.0边</el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                  </template>
                </div>
                <!-- 备注 -->
                <div class="manufacturing-ct"
                  v-if="scope.row.NCM_NOTE || scope.row.NCM_JOINT || scope.row.NCM_WRINKLE || scope.row.NCM_MAKETYPE ">
                  <span>【备注】: <template
                      v-if="scope.row.NCM_MAKETYPE">{{scope.row.NCM_MAKETYPE | makeType_filter}}<template
                        v-if="scope.row.NCM_JOINT || scope.row.NCM_WRINKLE || scope.row.NCM_MAKETYPE">、</template></template>
                    <template v-if="scope.row.NCM_JOINT">{{scope.row.NCM_JOINT | joint_filter}}<template
                        v-if="scope.row.NCM_WRINKLE || scope.row.NCM_MAKETYPE">、</template></template>
                    <template v-if="scope.row.NCM_WRINKLE">{{scope.row.NCM_WRINKLE }}褶<template
                        v-if="scope.row.NCM_MAKETYPE">、</template></template>
                    <template v-if="scope.row.NCM_NOTE">{{scope.row.NCM_NOTE }}</template></span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="数量" width="60" align="center" prop="curtain_area">
              <template slot-scope="scope">
                <!-- 只有部件显示数量 -->
                <span
                  v-if="scope.row.curtain_level == 0 && scope.row.TOTAL_ENABLE == 1">{{scope.row.curtain_area}}</span>
                <span v-else-if="scope.row.TOTAL_ENABLE == 2">
                  <el-input v-model="scope.row.curtain_area" style="width:40px;" size="mini" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>
                </span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="单位" width="60" align="center" prop="UNIT_NAME"></el-table-column>
            <el-table-column label="库存" width="60" align="center" prop="curtain_store"></el-table-column>
            <el-table-column label="单价" width="60" align="center" prop="curtain_price" v-if="isManager != '0'">
              <template slot-scope="scope">
                <!-- 只有部件算钱 -->
                <span v-if="scope.row.ITEM_NO && scope.row.curtain_level == 0">{{scope.row.curtain_price}}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="折后" width="60" align="center" v-if="isManager != '0'">
              <template slot-scope="scope">
                <!-- 只有部件算钱 -->
                <span
                  v-if="scope.row.ITEM_NO && scope.row.curtain_level == 0">{{ calculatePromotionPrice(scope.row) }}</span>
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
            <el-table-column label="说明" align="center"></el-table-column>
          </el-table>
          <div v-if="isManager != '0'" style="font-size:16px;margin-top:10px;margin-left: 1010px;">
            <span>总计：<span style="color:red;">￥{{ allTotal | dosageFilter }}</span></span>
          </div>
          <div style="text-align: center;margin-bottom:10px;">
            <el-button type="danger" width="130px" @click="addCurtainToShoppingCar">保存至购物车</el-button>
            <el-button type="info" width="130px">返回</el-button>
          </div>
        </div>
      </div>
      <div class="no-data" v-if="noData">
        未查询到相关数据！
      </div>
    </div>
    <!-- 替换组件 -->
    <el-drawer :title='"【" + transPartTypeCode(exchangeModelTemplate.NC_PART_TYPECODE) + "】" + "可替换列表"'
      :visible.sync="drawerShow" :with-header="false" :size="isManager!='0'?'730px':'670px'">
      <span style="color:grey;margin-left:10px;">*单击选择</span>
      <div class="model-exchange-list">
        <div class="model-exchange-list-ct">
          <div v-for="(item, index) in exchangeModelList" :key="index" class="model-exchange-ct"
            :class="{'model-exchange-now': item.NC_MODEL_ID == exchangeModelNow.NC_MODEL_ID }"
            @click="onChangeModelClick(item)">
            <div class="model-exchange-inner">
              <el-table :data="item.curtain_model" border :style="{width: isManager!='0'?'670px':'610px'}">
                <el-table-column label="部件" width="80" header-align="center" prop="NC_PART_TYPECODE">
                  <template slot-scope="scope">
                    <!-- 树缩进 -->
                    <span v-if="scope.row.curtain_level > 0">
                      <span :style="{'padding-left': scope.row.curtain_level * 16 + 'px'}"></span>
                    </span>
                    <span
                      :style="{'font-weight': scope.row.curtain_level==0?'bold':''}">{{transPartTypeCode(scope.row.NC_PART_TYPECODE)}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="编码" width="170" header-align="center" prop="ITEM_NO">
                </el-table-column>
                <el-table-column label="名称" width="80" header-align="center" prop="NOTE">
                </el-table-column>
                <el-table-column label="库存" width="60" align="center" prop="curtain_store"></el-table-column>
                <el-table-column label="单价" width="60" align="center" prop="curtain_price" v-if="isManager != '0'">
                  <template slot-scope="scope">
                    <!-- 只有部件算钱 -->
                    <span v-if="scope.row.curtain_level == 0">{{scope.row.curtain_price}}</span>
                    <span v-else>-</span>
                  </template>
                </el-table-column>
                <el-table-column label="备注" header-align="center" prop="NOTE">
                  <template slot-scope="scope">
                    <template v-if="scope.row.NCM_MAKETYPE">{{scope.row.NCM_MAKETYPE | makeType_filter}}<template
                        v-if="scope.row.NCM_JOINT || scope.row.NCM_WRINKLE || scope.row.NCM_MAKETYPE">、</template></template>
                    <template v-if="scope.row.NCM_JOINT">{{scope.row.NCM_JOINT | joint_filter}}<template
                        v-if="scope.row.NCM_WRINKLE || scope.row.NCM_MAKETYPE">、</template></template>
                    <template v-if="scope.row.NCM_WRINKLE">{{scope.row.NCM_WRINKLE }}褶<template
                        v-if="scope.row.NCM_MAKETYPE">、</template></template>
                    <template v-if="scope.row.NCM_NOTE">{{scope.row.NCM_NOTE }}</template>
                  </template>
                </el-table-column>
              </el-table>
              <label class="default-model-label"
                v-if="item.NC_MODEL_ID == exchangeModelTemplate.NC_MODEL_ID">默认组件</label>
              <!-- 序号 -->
              <el-badge class="index-badge" :value="index+1" />
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
    <!-- 替换子件 -->
    <el-drawer :title='"【" + exchangeItemNow.ITEM_NO + " " + exchangeItemNow.NOTE + "】" +  "可替换列表"'
      :visible.sync="drawerShow2" :with-header="false" size="530px">
      <div style="padding:0 10px;margin-bottom:10px;">
        <el-input clearable v-model.trim="itemCondition" @clear="getExangeItemList" size="small"
          @keyup.enter.native="getExangeItemList" placeholder="请输入物料号" style="width:300px;">
          <el-button @click="getExangeItemList" slot="append" icon="el-icon-search">搜索</el-button>
        </el-input>
        <span style="color:grey;margin-left:10px;">*单击选择</span>
      </div>
      <div class="item-exchange-list">
        <div class="item-exchange-list-ct">
          <div v-for="(item, index) in exchangeItemList" :key="index" class="item-exchange-ct"
            :class="{'item-exchange-now': item.ITEM_NO == exchangeItemNow.ITEM_NO }" @click="onChangeItemClick(item)">
            <span>{{item.ITEM_NO + " " + item.NOTE}}</span>
            <label class="default-item-label" v-if="item.ITEM_NO == exchangeItemDefault.ITEM_NO">默认</label>
          </div>
        </div>
      </div>
      <el-pagination class="tc mt10" @current-change="getExangeItemList" :current-page.sync="currentPage"
        :page-size="limit" layout="total, prev, pager, next, jumper" :total="totalNumber">
      </el-pagination>
    </el-drawer>
  </el-card>
</template>

<script>
import {
  GetAsyncItemData,
  GetPartTypeDataTabale,
  GetCurtainTemplateAndModel,
  GetExchangeModel,
  GetExchangeModelItem,
} from "@/api/newCurtainASP";
import { GetPromotionByItem } from "@/api/orderListASP";
import Cookies from "js-cookie";
import Axios from "axios";

export default {
  data() {
    return {
      cid: Cookies.get("cid"), //cid
      customerType: Cookies.get("customerType"), //客户类型
      isManager: Cookies.get("isManager"), //是否为管理员
      searchKey: "DL407209K1",
      templateData: [], //查出来的原始数据
      curtainHeadData: {}, //帘款数据（没有拉边条）
      curtainDataOrigin: [], //拼接好的原始数据
      curtainDataChange: [], //替换后的原始数据
      curtainData: [], //显示的窗帘数据
      curtainPartTypeData: [], //类型字典
      previewUrl: "",
      defaultUrl:
        "http://www.luxlano.com/ddkc/ckfinder/userfiles/images/pimg/J370010.jpg",
      activityOptions: [], //活动集合
      noData: false,
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
    };
  },
  computed: {
    //当前选择的活动
    salPromotion() {
      var selectActivity = this.activityOptions.filter(
        (item) => item.P_ID == this.curtainHeadData.activityId
      );
      if (selectActivity.length) {
        return selectActivity[0];
      } else {
        return {};
      }
    },
    allTotal() {
      var totalMoney = 0;
      //找到勾选的
      for (var i = 0; i < this.curtainData.length; i++) {
        if (
          this.curtainData[i].curtain_choose == true &&
          this.curtainData[i].curtain_level == 0
        ) {
          totalMoney = totalMoney.add(this.oneTotal(this.curtainData[i]));
        }
      }
      return totalMoney * this.curtainHeadData.setNum;
    },
    chooseCurtainData() {
      return this.curtainData.filter((item) => item.curtain_choose);
    },
  },
  filters: {
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
      var typeCode = this.curtainPartTypeData.filter(
        (item) => item.NC_PART_TYPECODE == val
      );
      if (typeCode.length) {
        name = typeCode[0].NC_PART_NAME;
      }
      return name;
    },
    //远程模糊搜索前5条数据
    querySearchAsync(queryString, cb) {
      GetAsyncItemData({ condition: this.searchKey }, { loading: false }).then(
        (res) => {
          var results = [];
          for (var i = 0; i < res.data.length; i++) {
            results.push({
              value: res.data[i].ITEM_NO,
            });
          }
          cb(results);
        }
      );
    },
    //搜索窗帘
    searchCurtain() {
      this.templateData = [];
      this.curtainHeadData = {};
      this.curtainData = [];
      this.curtainDataOrigin = [];
      this.curtainDataChange = [];
      GetCurtainTemplateAndModel({ item_no: this.searchKey }).then((res) => {
        this.templateData = res.data;
        if (this.templateData.length) {
          this.noData = false;
          //帘款
          var headData = this.templateData.filter(
            (item) => item.NC_PART_TYPECODE == "LK"
          );
          if (headData.length) {
            this.curtainHeadData = headData[0];
            //宽高，活动，位置，套数
            this.$set(this.curtainHeadData, "width", 0);
            this.$set(this.curtainHeadData, "height", 0);
            this.$set(this.curtainHeadData, "activityId", "");
            this.$set(this.curtainHeadData, "location", "");
            this.$set(this.curtainHeadData, "setNum", 1);
            //加载活动
            this.getActivity();
          }
          //预览图片
          this.previewUrl = `http://www.luxlano.com/ddkc/ckfinder/userfiles/images/pimg/${this.curtainHeadData.ITEM_NO}.jpg`;
          //拼接出窗帘
          var curtain_temp = [];
          for (var i = 0; i < this.templateData.length; i++) {
            var oneTemplate = this.templateData[i];
            if (oneTemplate.NC_PART_TYPECODE == "LK") continue;
            if (oneTemplate.curtain_model == null) {
              //没有选择结构的，只保留机构，其他用未选择
              var tempData = {
                ...oneTemplate,
                curtain_choose: true,
                curtain_level: 0,
                //其他属性不需要吧
              };
              curtain_temp.push(tempData);
            } else {
              //其他直接拼接上去
              curtain_temp.push(...oneTemplate.curtain_model);
            }
          }
          this.curtainDataOrigin = this.getCurtainOtherMsg(curtain_temp);
          this.curtainDataOrigin = this.getStoreData(this.curtainDataOrigin);
          //处理拉边条数据
          for (var i = 0; i < this.curtainDataOrigin.length; i++) {
            var oneCurtain = this.curtainDataOrigin[i];
            if (oneCurtain.NC_PART_TYPECODE == "LBT") {
              //先看父节点需不需要加载出拉边条
              var fatherCurtain = this.curtainDataOrigin.filter(
                (item) =>
                  item.NC_MODEL_ID == oneCurtain.NCM_PID &&
                  item.BIAN_ENABLE > 0 &&
                  item.NCM_BIAN == "4B"
              );
              if (fatherCurtain.length) {
                //如果需要加载，看排序最大的面料对应的拉边条,并且是要勾选的
                var mlList = this.curtainData.filter(
                  (item) =>
                    item.NCM_PID == oneCurtain.NCM_PID &&
                    item.NC_PART_TYPECODE != "LBT" &&
                    item.curtain_choose
                );
                //最大排序的那个model对应的拉边条需要显示（这里处理一下，有可能模板维护的不对应，强制改成对应的）
                if (mlList.length) {
                  this.curtainData.push({ ...oneCurtain });
                  //强制改成对应的ITEM_NO
                  this.curtainData[this.curtainData.length - 1].ITEM_NO =
                    mlList[mlList.length - 1].MATERIAL_NO;
                }
              }
            } else {
              this.curtainData.push({ ...oneCurtain });
            }
          }
          this.curtainData = this.getStoreData(this.curtainData);
          this.curtainDataChange = JSON.parse(
            JSON.stringify(this.curtainDataOrigin)
          );
        } else {
          this.noData = true;
        }
      });
    },
    //获得活动
    getActivity() {
      this.activityOptions = [];
      GetPromotionByItem(
        {
          cid: this.cid,
          customerType: this.customerType,
          itemNo: this.curtainHeadData.ITEM_NO,
          itemVersion: this.curtainHeadData.ITEM_VERSION,
          productType: this.curtainHeadData.PRODUCT_TYPE,
          productBrand: this.curtainHeadData.PRODUCT_BRAND,
        },
        { loading: false }
      ).then((res) => {
        this.activityOptions = res.data;
        this.activityOptions.push({
          ORDER_TYPE: "",
          ORDER_NAME: "不参与活动",
          P_ID: null,
        });
        var defaultSel = {
          pri: 0,
          id: 0,
        };
        for (var j = 0; j < res.data.length; j++) {
          if (res.data[j].PRIORITY != 0 && defaultSel.pri == 0) {
            defaultSel.pri = res.data[j].PRIORITY;
            defaultSel.id = res.data[j].P_ID;
          } else if (
            res.data[j].PRIORITY != 0 &&
            defaultSel.pri > res.data[j].PRIORITY
          ) {
            defaultSel.pri = res.data[j].PRIORITY;
            defaultSel.id = res.data[j].P_ID;
          }
        }

        if (defaultSel.pri != 0) {
          this.curtainHeadData.activityId = defaultSel.id;
        }
      });
    },
    //添加其他没有的字段
    getCurtainOtherMsg(originData, originLevel) {
      //除了后台查出来的数据以外前端需要的数据
      for (var i = 0; i < originData.length; i++) {
        if (!originData[i].ITEM_NO) continue;
        //窗帘层级
        var level = 0;
        if (originLevel != undefined) level = originLevel;
        else {
          var NCM_PID = originData[i].NCM_PID;
          while (NCM_PID != 0) {
            var temp = originData.filter((item) => item.NC_MODEL_ID == NCM_PID);
            if (temp.length) {
              NCM_PID = temp[0].NCM_PID;
              level++;
            }
          }
        }
        this.$set(originData[i], "curtain_level", level);
        //选中标识(父节点以部件为准，子节点综合父节点考虑)
        var defaultChose =
          originData[i].NCT_DELETE < 2 && originData[i].NCM_DELETE < 2;
        this.$set(originData[i], "curtain_choose", defaultChose);
        //单价
        var price = this.getPrice(this.customerType, originData[i]);
        this.$set(originData[i], "curtain_price", price);
        //宽
        this.$set(originData[i], "curtain_width", 0);
        //高
        this.$set(originData[i], "curtain_height", 0);
        //总数（面积）
        var area = 0;
        if (originData[i].NC_PART_TYPECODE == "GBD") area = 1; //挂绑带默认为1
        this.$set(originData[i], "curtain_area", area);
        //左转角
        this.$set(originData[i], "curtain_left_filet", 0);
        //右转角
        this.$set(originData[i], "curtain_right_filet", 0);
        //库存
        this.$set(originData[i], "curtain_store", "");
      }
      return originData;
    },
    getStoreData(originData) {
      for (var i = 0; i < originData.length; i++) {
        if (!originData[i].ITEM_NO) continue;
        //库存
        var postData = {
          token: "兰居尚品",
          code: originData[i].ITEM_NO,
        };
        Axios.post("http://ljsp.ubxiu.com:8098/api/getXXDMX", postData, {
          params: postData,
          loading: false,
        }).then((res) => {
          if (res.data && res.data.data) {
            var data = originData.filter(
              (item) => item.ITEM_NO == res.data.data.code
            );
            if (data.length) {
              data[0].curtain_store = res.data.data.kucun;
            }
          }
        });
      }
      return originData;
    },
    //根据客户类型获取价格
    getPrice(type, item) {
      var price = 0;
      if (item) {
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
    //改变成品宽
    changeHeadWidth(val) {
      for (var i = 0; i < this.curtainData.length; i++) {
        if (this.curtainData[i].WIDTH_ENABLE > 0) {
          this.curtainData[i].curtain_width = this.dosageFilter(
            val * this.curtainData[i].NCM_WIDTH_RATIO
          );
          this.changeOneWidthOrHeight(val, i);
        }
      }
    },
    //改变成品高
    changeHeadHeight(val) {
      for (var i = 0; i < this.curtainData.length; i++) {
        if (this.curtainData[i].WIDTH_ENABLE > 0) {
          this.curtainData[i].curtain_height = this.dosageFilter(
            val * this.curtainData[i].NCM_HEIGHT_RATIO
          );
          this.changeOneWidthOrHeight(val, i);
        }
      }
    },
    //改变单个宽或者高
    changeOneWidthOrHeight(val, index) {
      this.curtainData[index].curtain_area = this.dosageFilter(
        this.curtainData[index].curtain_width *
          this.curtainData[index].curtain_height
      );
      if (this.curtainData[index].NC_PART_TYPECODE == "LS") {
        //改变里衬布的
        var LCBITEM = this.curtainData.filter(
          (item) => item.NC_PART_TYPECODE == "LCB"
        );
        for (var i = 0; i < LCBITEM.length; i++) {
          //假设有多个里衬布的情况
          LCBITEM[i].curtain_area = this.curtainData[index].curtain_area;
        }
      }
    },
    //计算折后价格
    calculatePromotionPrice(data) {
      var price = 0;
      if (data && data.curtain_price) {
        //首先判断TYPE,1折扣，2定价
        if (this.salPromotion && this.salPromotion.P_ID) {
          switch (this.salPromotion.TYPE) {
            case "1":
              //折扣
              price = data.curtain_price.mul(this.salPromotion.DISCOUNT);
              break;
            case "2":
              //定价
              price = this.salPromotion.PRICE;
          }
        } else {
          price = data.curtain_price;
        }
      }
      return this.dosageFilter(price);
    },
    //一个子件的总价
    oneTotal(row) {
      var price = this.calculatePromotionPrice(row);
      return price.mul(row.curtain_area);
    },
    //处理拉边条
    handleBianCommand(common, row) {
      if (common == "4B" && row.NCM_BIAN != "4B") {
        //显示拉边条
        //先看看当前数据有没有这个拉边条，有的话应该是bug
        var lbtItemNow = this.curtainData.filter(
          (item) =>
            item.NCM_PID == row.NC_MODEL_ID && item.NC_PART_TYPECODE == "LBT"
        );
        if (lbtItemNow.length) return;
        //找到最大序号的面料,并且是要勾选的
        var mlList = this.curtainData.filter(
          (item) =>
            item.NCM_PID == row.NC_MODEL_ID &&
            item.NC_PART_TYPECODE != "LBT" &&
            item.curtain_choose
        );
        if (mlList.length) {
          //在原始数据中找到拉边条数据并push进去
          var lbtItem = this.curtainDataOrigin.filter(
            (item) =>
              item.NCM_PID == row.NC_MODEL_ID && item.NC_PART_TYPECODE == "LBT"
          );
          if (lbtItem.length) {
            lbtItem = lbtItem[0]; //只取第一个拉边条（按理应该只有一个）
            this.curtainData.push({ ...lbtItem });
            //强制改成对应的ITEM_NO
            this.curtainData[this.curtainData.length - 1].ITEM_NO =
              mlList[mlList.length - 1].MATERIAL_NO;
            //排序
            this.curtainData.sort((a, b) => {
              if (a.NCT_SORTNO == b.NCT_SORTNO) {
                return a.NCM_SORTNO > b.NCM_SORTNO ? 1 : -1;
              }
              return a.NCT_SORTNO > b.NCT_SORTNO ? 1 : -1;
            });
            console.log(this.curtainData);
          }
        }
      } else if (common == "3B" && row.NCM_BIAN == "4B") {
        //去掉拉边条
        //找到有没有拉边条
        var lbtItem = this.curtainData.filter(
          (item) =>
            item.NCM_PID == row.NC_MODEL_ID && item.NC_PART_TYPECODE == "LBT"
        );
        //应该只有一个拉边条，但是循环一下，保险
        for (var i = 0; i < lbtItem.length; i++) {
          this.curtainData.splice(this.curtainData.indexOf(lbtItem[i]), 1);
        }
      }
    },
    //勾选的联动处理
    onCheckChange(checked, row) {
      if (!row.ITEM_NO) return;
      var childrenCurtain = this.curtainData.filter(
        (item) => item.NCM_PID == row.NC_MODEL_ID
      );
      var fatherCurtain = this.curtainData.filter(
        (item) => item.NC_MODEL_ID == row.NCM_PID
      );
      if (childrenCurtain.length) {
        //自身作为父节点，勾选或者取消，子节点应该同步
        for (var i = 0; i < childrenCurtain.length; i++) {
          childrenCurtain[i].curtain_choose = checked;
          //往下更新需要联动，往上更新不需要
          this.onCheckChange(checked, childrenCurtain[i]);
        }
      }
      if (fatherCurtain.length) {
        fatherCurtain = fatherCurtain[0];
        //自身作为子节点，分两种情况
        if (checked) {
          //子节点勾选，父节点肯定要勾选
          fatherCurtain.curtain_choose = checked;
          //勾选上的时候看需不需要加载自己的拉边条，看自己是不是最大排序的那个
          //从父节点看是否需要加载
          if (fatherCurtain.BIAN_ENABLE > 0 && fatherCurtain.NCM_BIAN == "4B") {
            var mlList = this.curtainData.filter(
              (item) =>
                item.NCM_PID == row.NCM_PID &&
                item.NC_PART_TYPECODE != "LBT" &&
                item.curtain_choose
            );
            if (
              mlList.length &&
              mlList[mlList.length - 1].ITEM_NO == row.ITEM_NO
            ) {
              //先看看当前数据有没有拉边条，有的话应该是全选的时候这一条还没勾选上的时候上一条数据加载的
              var lbtItemNow = this.curtainData.filter(
                (item) =>
                  item.NCM_PID == row.NCM_PID && item.NC_PART_TYPECODE == "LBT"
              );
              if (lbtItemNow.length == 0) {
                //在原始数据中找到拉边条数据并push进去
                var lbtItem = this.curtainDataOrigin.filter(
                  (item) =>
                    item.NCM_PID == row.NCM_PID &&
                    item.NC_PART_TYPECODE == "LBT"
                );
                if (lbtItem.length) {
                  lbtItem = lbtItem[0]; //只取第一个拉边条（按理应该只有一个）
                  this.curtainData.push({ ...lbtItem });
                  //强制改成对应的ITEM_NO
                  this.curtainData[this.curtainData.length - 1].ITEM_NO =
                    mlList[mlList.length - 1].MATERIAL_NO;
                  //排序
                  this.curtainData.sort((a, b) => {
                    if (a.NCT_SORTNO == b.NCT_SORTNO) {
                      return a.NCM_SORTNO > b.NCM_SORTNO ? 1 : -1;
                    }
                    return a.NCT_SORTNO > b.NCT_SORTNO ? 1 : -1;
                  });
                }
              } else {
                //有的话直接更新
                lbtItemNow[0].ITEM_NO = mlList[mlList.length - 1].MATERIAL_NO;
              }
            }
          }
        } else {
          //取消勾选删掉对应的拉边条，并找有没有其他
          //从父节点看是否需要删除
          if (fatherCurtain.BIAN_ENABLE > 0 && fatherCurtain.NCM_BIAN == "4B") {
            var lbtItem = this.curtainData.filter(
              (item) =>
                item.NCM_PID == row.NCM_PID && item.NC_PART_TYPECODE == "LBT"
            );
            if (lbtItem.length) {
              //继续找到最大的面料对应的拉边条
              var mlList = this.curtainData.filter(
                (item) =>
                  item.NCM_PID == row.NCM_PID &&
                  item.NC_PART_TYPECODE != "LBT" &&
                  item.curtain_choose
              );
              if (mlList.length) {
                //有的话更新拉边条
                lbtItem[0].ITEM_NO = mlList[mlList.length - 1].MATERIAL_NO;
              } else {
                //没有的话删除拉边条
                for (var i = 0; i < lbtItem.length; i++) {
                  this.curtainData.splice(
                    this.curtainData.indexOf(lbtItem[i]),
                    1
                  );
                }
              }
            }
          }
          //子节点取消勾选，如果同级没有其他勾选了，父节点取消勾选
          var brotherCurtain = this.curtainData.filter(
            (item) => item.NCM_PID == row.NCM_PID && item.curtain_choose
          );
          if (brotherCurtain.length == 0)
            fatherCurtain.curtain_choose = checked;
        }
      }
    },
    //点击显示可替换列表
    exchangeModelOrItem(row) {
      if (!row.curtain_choose) return;
      if (row.curtain_level == 0) {
        //整个组件替换
        this.exchangeModelNow = JSON.parse(JSON.stringify(row)); //当前数据
        this.getExchangeModelList();
      } else {
        //子件替换
        this.exchangeItemNow = JSON.parse(JSON.stringify(row)); //当前数据
        this.getExangeItemList();
      }
    },
    //获得可替换组件列表
    getExchangeModelList() {
      this.exchangeModelList = [];
      GetExchangeModel({
        NC_TEMPLATE_ID: this.exchangeModelNow.NC_TEMPLATE_ID,
      }).then((res) => {
        if (
          res.data.length > 0 ||
          (res.data.length == 1 &&
            res.data[0].NC_MODEL_ID != this.exchangeModelNow.NC_MODEL_ID)
        ) {
          this.exchangeModelList = res.data;
          //默认数据
          var defaultModel = this.templateData.filter(
            (item) =>
              item.NC_TEMPLATE_ID == this.exchangeModelNow.NC_TEMPLATE_ID
          );
          if (defaultModel.length) {
            this.exchangeModelTemplate = defaultModel[0];
          }
          //添加层级数据
          for (var i = 0; i < this.exchangeModelList.length; i++) {
            var curtain_list = this.exchangeModelList[i].curtain_model;
            for (var j = 0; j < curtain_list.length; j++) {
              var level = 0;
              var NCM_PID = curtain_list[j].NCM_PID;
              while (NCM_PID != 0) {
                var temp = curtain_list.filter(
                  (item) => item.NC_MODEL_ID == NCM_PID
                );
                if (temp.length) {
                  NCM_PID = temp[0].NCM_PID;
                  level++;
                }
              }
              this.$set(curtain_list[j], "curtain_level", level);
              //单价
              var price = this.getPrice(this.customerType, curtain_list[j]);
              this.$set(curtain_list[j], "curtain_price", price);
            }
            //库存
            curtain_list = this.getStoreData(curtain_list);
          }
          this.drawerShow = true;
        } else {
          this.$message({
            message: "没有可替换的组件!",
            type: "warning",
            duration: 1000,
          });
        }
      });
    },
    //点击替换
    onChangeModelClick(model) {
      if (model.NC_MODEL_ID == this.exchangeModelNow.NC_MODEL_ID) return;
      var selectModel = model.curtain_model.filter(
        (item) => item.NC_MODEL_ID == model.NC_MODEL_ID
      );
      if (selectModel.length) {
        selectModel = selectModel[0];
        var msg = "";
        if (this.exchangeModelNow.ITEM_NO) {
          msg = `确认使用【${selectModel.ITEM_NO}】替换当前【${this.exchangeModelNow.ITEM_NO}】？`;
        } else {
          msg = `确认使用【${selectModel.ITEM_NO}】作为当前组件？`;
        }
        this.$confirm(msg, "提示", {
          confirmButtonText: "是",
          cancelButtonText: "否",
          type: "warning",
        })
          .then(() => {
            //替换当前，第一步，把当前的删掉
            this.curtainData = this.curtainData.filter(
              (item) =>
                item.NC_TEMPLATE_ID != this.exchangeModelNow.NC_TEMPLATE_ID
            );
            this.curtainDataChange = this.curtainDataChange.filter(
              (item) =>
                item.NC_TEMPLATE_ID != this.exchangeModelNow.NC_TEMPLATE_ID
            );
            //第二步，把当前选中的push进去
            var curtain_temp = this.getOtherCurtainMsgForExchange(
              model.curtain_model
            );
            for (var i = 0; i < curtain_temp.length; i++) {
              var oneCurtain = curtain_temp[i];
              if (oneCurtain.NC_PART_TYPECODE == "LBT") {
                //先看父节点需不需要加载出拉边条
                var fatherCurtain = curtain_temp.filter(
                  (item) =>
                    item.NC_MODEL_ID == oneCurtain.NCM_PID &&
                    item.BIAN_ENABLE > 0 &&
                    item.NCM_BIAN == "4B"
                );
                if (fatherCurtain.length) {
                  //如果需要加载，看排序最大的面料对应的拉边条,并且是要勾选的
                  var mlList = this.curtainData.filter(
                    (item) =>
                      item.NCM_PID == oneCurtain.NCM_PID &&
                      item.NC_PART_TYPECODE != "LBT" &&
                      item.curtain_choose
                  );
                  if (mlList.length) {
                    this.curtainData.push({ ...oneCurtain });
                    this.curtainData[this.curtainData.length - 1].ITEM_NO =
                      mlList[mlList.length - 1].MATERIAL_NO;
                  }
                }
              } else {
                this.curtainData.push({ ...oneCurtain });
              }
            }
            this.curtainData.sort((a, b) => {
              if (a.NCT_SORTNO == b.NCT_SORTNO) {
                return a.NCM_SORTNO > b.NCM_SORTNO ? 1 : -1;
              }
              return a.NCT_SORTNO > b.NCT_SORTNO ? 1 : -1;
            });
            this.curtainDataChange.push(...curtain_temp);
            //this.exchangeModelNow = selectModel;
            this.drawerShow = false;
            this.$nextTick(() => {
              this.$refs.curtainTable.doLayout();
            });
          })
          .catch(() => {});
      }
    },
    //添加其他没有的数据
    getOtherCurtainMsgForExchange(originData, originLevel) {
      for (var i = 0; i < originData.length; i++) {
        //选中标识(父节点以部件为准，子节点综合父节点考虑)
        var defaultChose =
          originData[i].NCT_DELETE < 2 && originData[i].NCM_DELETE < 2;
        this.$set(originData[i], "curtain_choose", defaultChose);
        //单价
        //var price = this.getPrice(this.customerType, originData[i]);
        //this.$set(originData[i], "curtain_price", price);
        //宽
        var curtain_width = this.dosageFilter(
          this.curtainHeadData.width * originData[i].NCM_WIDTH_RATIO
        );
        this.$set(originData[i], "curtain_width", curtain_width);
        //高
        var curtain_height = this.dosageFilter(
          this.curtainHeadData.height * originData[i].NCM_HEIGHT_RATIO
        );
        this.$set(originData[i], "curtain_height", curtain_height);
        //总数（面积）
        var area = this.dosageFilter(curtain_width * curtain_height);
        if (originData[i].NC_PART_TYPECODE == "GBD") area = 1; //挂绑带默认为1
        this.$set(originData[i], "curtain_area", area);
        if (originData[i].NC_PART_TYPECODE == "LS") {
          //改变里衬布的
          var LCBITEM = this.curtainData.filter(
            (item) => item.NC_PART_TYPECODE == "LCB"
          );
          for (var j = 0; j < LCBITEM.length; j++) {
            //假设有多个里衬布的情况
            LCBITEM[j].curtain_area = area;
          }
        }
        //左转角
        this.$set(originData[i], "curtain_left_filet", 0);
        //右转角
        this.$set(originData[i], "curtain_right_filet", 0);
        //库存
        //this.$set(originData[i], "curtain_store", "");
      }
      return originData;
    },
    //获得可替换子件列表
    getExangeItemList() {
      this.exchangeItemList = [];
      GetExchangeModelItem({
        NC_MODEL_ID: this.exchangeItemNow.NC_MODEL_ID,
        condition: this.itemCondition,
        page: this.currentPage,
        limit: this.limit,
      }).then((res) => {
        if (
          res.data.length > 0 ||
          (res.data.length == 1 &&
            res.data[0].ITEM_NO != this.exchangeItemNow.ITEM_NO)
        ) {
          this.exchangeItemList = res.data;
          this.totalNumber = res.count;
          //默认物料(从替换后的找)
          var defaultItem = this.curtainDataChange.filter(
            (item) => item.NC_MODEL_ID == this.exchangeItemNow.NC_MODEL_ID
          );
          if (defaultItem.length) {
            this.exchangeItemDefault = defaultItem[0];
          }
          this.drawerShow2 = true;
        } else {
          this.$message({
            message: "没有可替换的物料!",
            type: "warning",
            duration: 1000,
          });
        }
      });
    },
    onChangeItemClick(item) {
      if (item.ITEM_NO == this.exchangeItemNow.ITEM_NO) return;
      this.$confirm(
        `确认使用【${item.ITEM_NO}】替换当前【${this.exchangeItemNow.ITEM_NO}】？`,
        "提示",
        {
          confirmButtonText: "是",
          cancelButtonText: "否",
          type: "warning",
        }
      )
        .then(() => {
          //替换只是更换item，现在只需要替换字段ITEM_NO，NOTE和拉边条MATERIAL_NO
          var originItem = this.curtainData.filter(
            (item) => item.NC_MODEL_ID == this.exchangeItemNow.NC_MODEL_ID
          );
          if (originItem.length) {
            originItem = originItem[0];
            originItem.ITEM_NO = item.ITEM_NO;
            originItem.NOTE = item.NOTE;
            originItem.MATERIAL_NO = item.MATERIAL_NO;
          }
          //替换拉边条
          //如果需要加载，看自身是不是勾选中排序最大的
          var mlList = this.curtainData.filter(
            (item) =>
              item.NCM_PID == originItem.NCM_PID &&
              item.NC_PART_TYPECODE != "LBT" &&
              item.curtain_choose
          );
          if (
            mlList.length &&
            mlList[mlList.length - 1].ITEM_NO == originItem.ITEM_NO
          ) {
            //改变拉边条数据
            var lbtItem = this.curtainData.filter(
              (item) =>
                item.NCM_PID == originItem.NCM_PID &&
                item.NC_PART_TYPECODE == "LBT"
            );
            if (lbtItem.length) {
              lbtItem[0].ITEM_NO = originItem.MATERIAL_NO;
            }
          }
          //更新库存
          this.curtainData = this.getStoreData(this.curtainData);
          //this.exchangeItemNow.ITEM_NO = item.ITEM_NO;
          this.drawerShow2 = false;
        })
        .catch(() => {});
    },
    //合并第一列显示预览
    cellMerge({ row, column, rowIndex, columnIndex }) {
      if (columnIndex == 0) {
        if (rowIndex == 0) {
          return {
            rowspan: this.curtainData.length,
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
    //显示默认图片
    showDefaultImg(e) {
      this.previewUrl = this.defaultUrl;
    },
    beforeAddCar() {
      //表头
      if (!this.curtainHeadData.width) {
        this.$alert("请填写帘款【成品宽】", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return;
      }
      if (!this.curtainHeadData.height) {
        this.$alert("请填写帘款【成品高】", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return;
      }
      if (!this.curtainHeadData.setNum) {
        this.$alert("请填写帘款【套数】", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return;
      }
    },
    addCurtainToShoppingCar() {
      //添加之前的验证
      this.beforeAddCar();
    },
  },
  mounted() {
    this.getPartTypeData();
  },
};
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
  margin-top: 10px;
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
  cursor: pointer;
}
.a-userset {
  color: #409eff;
  background: 0 0;
  text-decoration: none;
  outline: 0;
  cursor: pointer;
  transition: color 0.2s ease;
}
.delete-cls {
  color: tomato;
  text-decoration: line-through;
  cursor: unset;
}
.manufacturing-ct {
  margin-bottom: 1px;
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
  cursor: pointer;
  box-sizing: border-box;
}
.model-exchange-ct:hover {
  border: 1px solid #409eff;
}
.model-exchange-now {
  background: #409eff;
}
.model-exchange-now:hover {
  border: none;
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
.curtain-table .el-input__inner {
  padding: 0 5px;
  height: 20px;
}
.index-badge .el-badge__content {
  background: gray;
}
</style>
