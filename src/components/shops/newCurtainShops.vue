<template>
  <el-card shadow="never">
    <div>
      <el-autocomplete :trigger-on-focus="false" clearable v-model.trim="searchKey" :fetch-suggestions="querySearchAsync"
        @select="searchCurtain" @clear="searchCurtain" @keyup.enter.native="searchCurtain" placeholder="请输入帘款查找窗帘"
        style="width:300px;">
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
          <!-- 成品宽 -->
          <span>成品宽<span style="color:red;">*</span>：</span>
          <el-input style="width:60px;" size="mini" v-model="curtainHeadData.width" @input="changeHeadWidth" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>
          <!-- 成品高 -->
          <span style="margin-left:10px;">成品高<span style="color:red;">*</span>：</span>
          <el-input style="width:60px;" size="mini" v-model="curtainHeadData.height" @input="changeHeadHeight" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>
          <!-- 暗槽高 -->
          <span style="margin-left:10px;">暗槽高<span style="color:red;">*</span>：</span>
          <el-input style="width:60px;" size="mini" v-model="curtainHeadData.ancaoHeight" @input="changeAncaoHeight" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>
          <!-- 活动 -->
          <span style="margin-left:10px;">活动：</span>
          <el-select size="mini" style="width:220px" v-model="curtainHeadData.activityId">
            <el-option v-for="item in activityOptions" :key="item.P_ID"
              :label="item.ORDER_TYPE? item.ORDER_TYPE + ' -- ' + item.ORDER_NAME : item.ORDER_NAME" :value="item.P_ID">
            </el-option>
          </el-select>
          <!-- 位置 -->
          <span style="margin-left:10px;">位置<span style="color:red;">*</span>：</span>
          <el-input style="width:100px;" v-model="curtainHeadData.location" size="mini"></el-input>
          <!-- 套数 -->
          <span style="margin-left:10px;">套数<span style="color:red;">*</span>：</span>
          <el-input style="width:50px;" v-model="curtainHeadData.setNum" size="mini" oninput="value=value.replace(/[^\d]/g,'')">
          </el-input>
        </div>
        <!-- 窗帘部件 -->
        <div class="curtain-list">
          <el-table :data="curtainData" ref="curtainTable" class="curtain-table" border :span-method="cellMerge"
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
                  <template v-else-if="scope.row.WIDTH_ENABLE == 2">
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
                  <template v-else-if="scope.row.HEIGHT_ENABLE == 2">
                    <span>【高】: <el-input v-model="scope.row.curtain_height" style="width:40px;" size="mini"
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
                  <template v-if="scope.row.LEFT_ENABLE == 1">
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
                  <template v-if="scope.row.RIGHT_ENABLE == 1">
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
                  <template v-if="scope.row.TIE_ENABLE == 1">
                    <span>【么术贴】: {{ scope.row.NCM_MESUTIE | meshutie_filter}}</span>
                  </template>
                  <template v-else-if="scope.row.TIE_ENABLE == 2">
                    <span>【么术贴】: </span>
                    <el-dropdown trigger="click">
                      <a class="a-userset">{{ scope.row.NCM_MESUTIE? scope.row.NCM_MESUTIE : '请选择' | meshutie_filter}}</a>
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
                  <template v-else-if="scope.row.KAIKOU_ENABLE == 2">
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
                  <template v-else-if="scope.row.OPERATION_ENABLE == 2">
                    <span>【工艺方式】: </span>
                    <el-dropdown trigger="click">
                      <a class="a-userset">{{ scope.row.NCM_OPERATION? scope.row.NCM_OPERATION : '请选择' | operation_filter}}</a>
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
                  <template v-else-if="scope.row.BIAN_ENABLE == 2">
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
                <!-- 说明 -->
                <div class="manufacturing-ct"
                  v-if="scope.row.NCM_NOTE || scope.row.NCM_JOINT || scope.row.NCM_WRINKLE || scope.row.NCM_MAKETYPE ">
                  <span>【说明】: <template v-if="scope.row.NCM_MAKETYPE">{{scope.row.NCM_MAKETYPE | makeType_filter}}<template
                        v-if="scope.row.NCM_JOINT || scope.row.NCM_WRINKLE || scope.row.NCM_NOTE">、</template></template>
                    <template v-if="scope.row.NCM_JOINT">{{scope.row.NCM_JOINT | joint_filter}}<template
                        v-if="scope.row.NCM_WRINKLE || scope.row.NCM_NOTE">、</template></template>
                    <template v-if="scope.row.NCM_WRINKLE">{{scope.row.NCM_WRINKLE }}褶<template
                        v-if="scope.row.NCM_NOTE">、</template></template>
                    <template v-if="scope.row.NCM_NOTE">{{scope.row.NCM_NOTE }}</template></span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="用量" width="100" align="center" prop="DOSAGE">
              <template slot-scope="scope">
                <!-- 只有部件显示用量 -->
                <span
                  v-if="scope.row.curtain_level == 0 && scope.row.TOTAL_ENABLE == 1">{{scope.row.DOSAGE}}{{scope.row.UNIT_NAME}}</span>
                <span v-else-if="scope.row.TOTAL_ENABLE == 2">
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
                <el-input v-if="scope.row.ITEM_NO" :disabled="scope.row.NCM_KAIKOU != 'SK'" v-model="scope.row.curtain_note"
                  size="mini" type="textarea" resize="none" :autosize="{ maxRows: 6 }" clearable></el-input>
              </template>
            </el-table-column>
          </el-table>
          <div style="position: relative;">
            <span v-if="isManager != '0'" style="font-size:16px;position:absolute;left: 940px;">
              总计：<span style="color:red;">￥{{ allTotal | dosageFilter }}</span>
            </span>
          </div>
          <div style="text-align:center;margin:20px 0;">
            <el-button type="danger" width="130px" @click="addCurtainToShoppingCar">加入购物车</el-button>
          </div>
        </div>
      </div>
      <div class="no-data" v-if="noData">
        未查询到相关数据！
      </div>
    </div>
    <!-- 替换组件 -->
    <el-drawer :title='"【" + transPartTypeCode(exchangeModelTemplate.NC_PART_TYPECODE) + "】" + "可替换列表"' :visible.sync="drawerShow"
      :with-header="false" :size="isManager!='0'?'730px':'670px'">
      <span style="color:grey;margin-left:10px;">*单击选择</span>
      <div class="model-exchange-list">
        <div class="model-exchange-list-ct">
          <div v-for="(item, index) in exchangeModelList" :key="index" class="model-exchange-ct"
            :class="{'model-exchange-now': item.NC_MODEL_ID == exchangeModelNow.NC_MODEL_ID }" @click="onChangeModelClick(item)">
            <div class="model-exchange-inner">
              <el-table :data="item.curtain_model" border :style="{width: isManager!='0'?'670px':'610px'}"
                :row-class-name="tableRowClassName">
                <el-table-column label="部件" width="80" header-align="center" prop="NC_PART_TYPECODE">
                  <template slot-scope="scope">
                    <!-- 树缩进 -->
                    <span v-if="scope.row.curtain_level > 0">
                      <span :style="{'padding-left': scope.row.curtain_level * 16 + 'px'}"></span>
                    </span>
                    <span>{{transPartTypeCode(scope.row.NC_PART_TYPECODE)}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="编码" width="170" header-align="center" prop="ITEM_NO">
                </el-table-column>
                <el-table-column label="名称" width="80" header-align="center" prop="NOTE">
                </el-table-column>
                <el-table-column label="库存" width="60" align="center" prop="curtain_store"></el-table-column>
                <el-table-column label="单价" width="60" align="center" prop="PRICE" v-if="isManager != '0'">
                  <template slot-scope="scope">
                    <!-- 只有部件算钱 -->
                    <span v-if="scope.row.curtain_level == 0">{{scope.row.PRICE}}</span>
                    <span v-else>-</span>
                  </template>
                </el-table-column>
                <el-table-column label="说明" header-align="center" prop="NOTE">
                  <template slot-scope="scope">
                    <template v-if="scope.row.NCM_MAKETYPE">{{scope.row.NCM_MAKETYPE | makeType_filter}}<template
                        v-if="scope.row.NCM_JOINT || scope.row.NCM_WRINKLE || scope.row.NCM_NOTE">、</template></template>
                    <template v-if="scope.row.NCM_JOINT">{{scope.row.NCM_JOINT | joint_filter}}<template
                        v-if="scope.row.NCM_WRINKLE || scope.row.NCM_NOTE">、</template></template>
                    <template v-if="scope.row.NCM_WRINKLE">{{scope.row.NCM_WRINKLE }}褶<template
                        v-if="scope.row.NCM_NOTE">、</template></template>
                    <template v-if="scope.row.NCM_NOTE">{{scope.row.NCM_NOTE }}</template>
                  </template>
                </el-table-column>
              </el-table>
              <label class="default-model-label" v-if="item.NC_MODEL_ID == exchangeModelTemplate.NC_MODEL_ID">默认组件</label>
              <!-- 序号 -->
              <el-badge class="index-badge" :value="index+1" />
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
    <!-- 替换子件 -->
    <el-drawer :title='"【" + exchangeItemNow.ITEM_NO + " " + exchangeItemNow.NOTE + "】" +  "可替换列表"' :visible.sync="drawerShow2"
      :with-header="false" size="530px">
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
      <el-pagination class="tc mt10" @current-change="getExangeItemList" :current-page.sync="currentPage" :page-size="limit"
        layout="total, prev, pager, next, jumper" :total="totalNumber">
      </el-pagination>
    </el-drawer>
  </el-card>
</template>

<script>
import {
  GetAsyncItemData,
  GetPartTypeDataTable,
  GetCurtainTemplateAndModel,
  GetExchangeModel,
  GetExchangeModelItem,
  AddNewCurtainToCart
} from "@/api/newCurtainASP";
import { GetPromotionByItem } from "@/api/orderListASP";
import Cookies from "js-cookie";
import Axios from "axios";
import { mapActions } from "vuex";

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
      havePicture: true
    };
  },
  computed: {
    //当前选择的活动
    salPromotion() {
      var selectActivity = this.activityOptions.filter((item) => item.P_ID == this.curtainHeadData.activityId);
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
        var oneCurtain = this.curtainData[i];
        if (oneCurtain.curtain_choose == true && oneCurtain.curtain_level == 0) {
          totalMoney = totalMoney.add(this.oneTotal(oneCurtain));
        }
      }
      totalMoney = totalMoney * this.curtainHeadData.setNum;
      return totalMoney;
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
    ...mapActions("navTabs", ["closeToTab"]),
    //PartType字典
    getPartTypeData() {
      GetPartTypeDataTable().then((res) => {
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
      this.havePicture = true;
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
            this.$set(this.curtainHeadData, "ancaoHeight", 0);
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
              var fatherCurtain = this.curtainDataOrigin.filter((item) =>
                item.NC_MODEL_ID == oneCurtain.NCM_PID &&
                item.BIAN_ENABLE > 0 &&
                item.NCM_BIAN == "4B"
              );
              if (fatherCurtain.length) {
                //如果需要加载，看排序最大的面料对应的拉边条,并且是要勾选的
                var mlList = this.curtainData.filter((item) =>
                  item.NCM_PID == oneCurtain.NCM_PID &&
                  item.NC_PART_TYPECODE != "LBT" &&
                  item.curtain_choose
                );
                //最大排序的那个model对应的拉边条需要显示（这里处理一下，有可能模板维护的不对应，强制改成对应的）
                if (mlList.length) {
                  this.curtainData.push({ ...oneCurtain });
                  //强制改成对应的ITEM_NO
                  this.curtainData[this.curtainData.length - 1].ITEM_NO = mlList[mlList.length - 1].MATERIAL_NO;
                }
              }
            } else {
              this.curtainData.push({ ...oneCurtain });
            }
          }
          this.curtainData = this.getStoreData(this.curtainData);
          this.curtainDataChange = JSON.parse(JSON.stringify(this.curtainDataOrigin));
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
        
        this.activityOptions = res.data;
        this.activityOptions.push({
          ORDER_TYPE: "",
          ORDER_NAME: "不参与活动",
          P_ID: "",
        });
      });
    },
    //添加其他没有的字段
    getCurtainOtherMsg(originData, originLevel) {
      //除了后台查出来的数据以外前端需要的数据
      for (var i = 0; i < originData.length; i++) {
        var oneCurtain = originData[i];
        if (!oneCurtain.ITEM_NO) continue;
        //窗帘层级
        var level = 0;
        if (originLevel != undefined) level = originLevel;
        else {
          var NCM_PID = oneCurtain.NCM_PID;
          while (NCM_PID != 0) {
            var temp = originData.filter((item) => item.NC_MODEL_ID == NCM_PID);
            if (temp.length) {
              NCM_PID = temp[0].NCM_PID;
              level++;
            }
          }
        }
        this.$set(oneCurtain, "curtain_level", level);
        //默认选中
        var defaultChose = false;
        if (oneCurtain.curtain_level == 0) {
          //根节点的由父节点控制
          defaultChose = oneCurtain.NCT_DELETE < 2;
        } else {
          //子节点综合父节点考虑
          defaultChose = oneCurtain.NCT_DELETE < 2 && oneCurtain.NCM_DELETE < 2;
        }
        this.$set(oneCurtain, "curtain_choose", defaultChose);
        //单价
        var price = this.getPrice(this.customerType, oneCurtain);
        this.$set(oneCurtain, "PRICE", price);
        //宽
        this.$set(oneCurtain, "curtain_width", 0);
        //高
        this.$set(oneCurtain, "curtain_height", 0);
        //总数（面积）
        var dosage = 0;
        if (oneCurtain.NC_PART_TYPECODE == "GBD") dosage = 1; //挂绑带默认为1
        this.$set(oneCurtain, "DOSAGE", dosage);
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
      return originData;
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
      for (var i = 0; i < this.curtainData.length; i++) {
        var oneCurtain = this.curtainData[i];
        if (oneCurtain.WIDTH_ENABLE > 0) {
          var width = this.convertNumber(this.curtainHeadData.width);
          oneCurtain.curtain_width = this.dosageFilter(width * oneCurtain.NCM_WIDTH_RATIO);
          this.changeOneWidthOrHeight(val, i);
        }
      }
    },
    //改变成品高
    changeHeadHeight(val) {
      for (var i = 0; i < this.curtainData.length; i++) {
        var oneCurtain = this.curtainData[i];
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
      for (var i = 0; i < this.curtainData.length; i++) {
        var oneCurtain = this.curtainData[i];
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
      var oneCurtain = this.curtainData[index];
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
        var LCBITEM = this.curtainData.filter((item) => item.NC_PART_TYPECODE == "LCB");
        for (var i = 0; i < LCBITEM.length; i++) {
          //假设有多个里衬布的情况
          LCBITEM[i].DOSAGE = oneCurtain.DOSAGE;
          this.getRemark(this.curtainData.indexOf(LCBITEM[i]));
        }
      }
      this.getRemark(index);
    },
    //直接改变帘身用量
    changeLSArea(val, index) {
      var oneCurtain = this.curtainData[index];
      if (oneCurtain.NC_PART_TYPECODE == "LS") {
        //改变里衬布的
        var LCBITEM = this.curtainData.filter((item) => item.NC_PART_TYPECODE == "LCB");
        for (var i = 0; i < LCBITEM.length; i++) {
          //假设有多个里衬布的情况
          LCBITEM[i].DOSAGE = oneCurtain.DOSAGE;
          this.getRemark(this.curtainData.indexOf(LCBITEM[i]));
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
    oneTotal(row) {
      var price = 0;
      if (row.DOSAGE) {
        price = this.calculatePromotionPrice(row);
        //最小下单量 帘头1.帘身里衬，窗纱4
        var DOSAGE = this.convertNumber(row.DOSAGE);
        if (row.NC_PART_TYPECODE == 'LT' && DOSAGE < 1) {
          DOSAGE = 1;
        } else if ((row.NC_PART_TYPECODE == 'LS'|| row.NC_PART_TYPECODE == 'LCB' || row.NC_PART_TYPECODE == 'CS') && DOSAGE < 4) {
          DOSAGE = 4;
        }
        price = price.mul(DOSAGE)
      }
      return price;
    },
    //处理拉边条
    handleBianCommand(common, row) {
      if (common == "4B" && row.NCM_BIAN != "4B") {
        //显示拉边条
        //先看看当前数据有没有这个拉边条，有的话应该是bug
        var lbtItemNow = this.curtainData.filter((item) => item.NCM_PID == row.NC_MODEL_ID && item.NC_PART_TYPECODE == "LBT");
        if (lbtItemNow.length) return;
        //找到最大序号的面料,并且是要勾选的
        var mlList = this.curtainData.filter(
          (item) =>
            item.NCM_PID == row.NC_MODEL_ID &&
            item.NC_PART_TYPECODE != "LBT" &&
            item.curtain_choose
        );
        if (mlList.length) {
          //在修改后的数据中找到拉边条数据并push进去
          var lbtItem = this.curtainDataChange.filter((item) => item.NCM_PID == row.NC_MODEL_ID && item.NC_PART_TYPECODE == "LBT");
          if (lbtItem.length) {
            lbtItem = lbtItem[0]; //只取第一个拉边条（按理应该只有一个）
            this.curtainData.push({ ...lbtItem });
            //强制改成对应的ITEM_NO
            this.curtainData[this.curtainData.length - 1].ITEM_NO = mlList[mlList.length - 1].MATERIAL_NO;
            //排序
            this.curtainData.sort((a, b) => {
              if (a.NCT_SORTNO == b.NCT_SORTNO) {
                return a.NCM_SORTNO > b.NCM_SORTNO ? 1 : -1;
              }
              return a.NCT_SORTNO > b.NCT_SORTNO ? 1 : -1;
            });
          }
        }
      } else if (common == "3B" && row.NCM_BIAN == "4B") {
        //去掉拉边条
        //找到有没有拉边条
        var lbtItem = this.curtainData.filter((item) => item.NCM_PID == row.NC_MODEL_ID && item.NC_PART_TYPECODE == "LBT");
        //应该只有一个拉边条，但是循环一下，保险
        for (var i = 0; i < lbtItem.length; i++) {
          this.curtainData.splice(this.curtainData.indexOf(lbtItem[i]), 1);
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
    //勾选的联动处理
    onCheckChange(checked, row) {
      //if (!row.ITEM_NO) return;
      var childrenCurtain = this.curtainData.filter((item) => item.NCM_PID == row.NC_MODEL_ID && row.NC_MODEL_ID != 0);
      var fatherCurtain = this.curtainData.filter((item) => item.NC_MODEL_ID == row.NCM_PID && item.NC_MODEL_ID != 0);
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
            var mlList = this.curtainData.filter((item) =>
              item.NCM_PID == row.NCM_PID &&
              item.NC_PART_TYPECODE != "LBT" &&
              item.curtain_choose
            );
            if (mlList.length && mlList[mlList.length - 1].ITEM_NO == row.ITEM_NO) {
              //先看看当前数据有没有拉边条，有的话应该是全选的时候这一条还没勾选上的时候上一条数据加载的
              var lbtItemNow = this.curtainData.filter((item) => item.NCM_PID == row.NCM_PID && item.NC_PART_TYPECODE == "LBT");
              if (lbtItemNow.length == 0) {
                //在修改后的数据中找到拉边条数据并push进去
                var lbtItem = this.curtainDataChange.filter((item) =>
                  item.NCM_PID == row.NCM_PID &&
                  item.NC_PART_TYPECODE == "LBT"
                );
                if (lbtItem.length) {
                  lbtItem = lbtItem[0]; //只取第一个拉边条（按理应该只有一个）
                  this.curtainData.push({ ...lbtItem });
                  //强制改成对应的ITEM_NO
                  this.curtainData[this.curtainData.length - 1].ITEM_NO = mlList[mlList.length - 1].MATERIAL_NO;
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
            var lbtItem = this.curtainData.filter((item) => item.NCM_PID == row.NCM_PID && item.NC_PART_TYPECODE == "LBT");
            if (lbtItem.length) {
              //继续找到最大的面料对应的拉边条
              var mlList = this.curtainData.filter((item) =>
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
                  this.curtainData.splice(this.curtainData.indexOf(lbtItem[i]), 1);
                }
              }
            }
          }
          //子节点取消勾选，如果同级没有其他勾选了，父节点取消勾选
          var brotherCurtain = this.curtainData.filter((item) => item.NCM_PID == row.NCM_PID && item.curtain_choose);
          if (brotherCurtain.length == 0)
            fatherCurtain.curtain_choose = checked;
        }
      }
      //帘身取消勾选，同时取消里衬布
      if (row.NC_PART_TYPECODE == 'LS' && !checked) {
        var LCBITEM = this.curtainData.filter((item) => item.NC_PART_TYPECODE == "LCB");
        for (var j = 0; j < LCBITEM.length; j++) {
          //假设有多个里衬布的情况
          LCBITEM[j].curtain_choose = checked;
          this.onCheckChange(checked, LCBITEM[j]);
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
        if (res.data.length > 0 || (res.data.length == 1 && res.data[0].NC_MODEL_ID != this.exchangeModelNow.NC_MODEL_ID)) {
          this.exchangeModelList = res.data;
          //默认数据
          var defaultModel = this.templateData.filter((item) => item.NC_TEMPLATE_ID == this.exchangeModelNow.NC_TEMPLATE_ID);
          if (defaultModel.length) {
            this.exchangeModelTemplate = defaultModel[0];
          }
          for (var i = 0; i < this.exchangeModelList.length; i++) {
            var curtain_list = this.exchangeModelList[i].curtain_model;
            for (var j = 0; j < curtain_list.length; j++) {
              var oneCurtain = curtain_list[j];
              //添加层级数据
              var level = 0;
              var NCM_PID = oneCurtain.NCM_PID;
              while (NCM_PID != 0) {
                var temp = curtain_list.filter((item) => item.NC_MODEL_ID == NCM_PID);
                if (temp.length) {
                  NCM_PID = temp[0].NCM_PID;
                  level++;
                }
              }
              this.$set(oneCurtain, "curtain_level", level);
              //勾选
              this.$set(oneCurtain, "curtain_choose", true);
              //单价
              var price = this.getPrice(this.customerType, oneCurtain);
              this.$set(oneCurtain, "PRICE", price);
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
    //点击替换组件
    onChangeModelClick(model) {
      if (model.NC_MODEL_ID == this.exchangeModelNow.NC_MODEL_ID) return;
      var selectModel = model.curtain_model.filter((item) => item.NC_MODEL_ID == model.NC_MODEL_ID);
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
        }).then(() => {
          //替换当前，第一步，把当前的删掉
          this.curtainData = this.curtainData.filter((item) => item.NC_TEMPLATE_ID != this.exchangeModelNow.NC_TEMPLATE_ID);
          this.curtainDataChange = this.curtainDataChange.filter((item) => item.NC_TEMPLATE_ID != this.exchangeModelNow.NC_TEMPLATE_ID);
          //第二步，把当前选中的push进去
          var curtain_temp = this.getOtherCurtainMsgForExchange(model.curtain_model);
          for (var i = 0; i < curtain_temp.length; i++) {
            var oneCurtain = curtain_temp[i];
            if (oneCurtain.NC_PART_TYPECODE == "LBT") {
              //先看父节点需不需要加载出拉边条
              var fatherCurtain = curtain_temp.filter((item) =>
                item.NC_MODEL_ID == oneCurtain.NCM_PID &&
                item.BIAN_ENABLE > 0 &&
                item.NCM_BIAN == "4B"
              );
              if (fatherCurtain.length) {
                //如果需要加载，看排序最大的面料对应的拉边条,并且是要勾选的
                var mlList = this.curtainData.filter((item) =>
                  item.NCM_PID == oneCurtain.NCM_PID &&
                  item.NC_PART_TYPECODE != "LBT" &&
                  item.curtain_choose
                );
                if (mlList.length) {
                  this.curtainData.push({ ...oneCurtain });
                  this.curtainData[this.curtainData.length - 1].ITEM_NO = mlList[mlList.length - 1].MATERIAL_NO;
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
          this.getRemark();
        }).catch(() => { });
      }
    },
    //添加其他没有的数据
    getOtherCurtainMsgForExchange(originData) {
      for (var i = 0; i < originData.length; i++) {
        var oneCurtain = originData[i];
        //默认选中
        var defaultChose = false;
        if (oneCurtain.curtain_level == 0) {
          //根节点的由父节点控制
          defaultChose = oneCurtain.NCT_DELETE < 2;
        } else {
          //子节点综合父节点考虑
          defaultChose = oneCurtain.NCT_DELETE < 2 && oneCurtain.NCM_DELETE < 2;
        }
        this.$set(oneCurtain, "curtain_choose", defaultChose);
        //宽
        var curtain_width = 0;
        if (oneCurtain.WIDTH_ENABLE > 0) {
          var width = this.convertNumber(this.curtainHeadData.width);
          curtain_width = this.dosageFilter(width * oneCurtain.NCM_WIDTH_RATIO);
        }
        this.$set(oneCurtain, "curtain_width", curtain_width);
        //高
        var curtain_height = 0;
        if (oneCurtain.HEIGHT_ENABLE > 0) {
          var height = this.convertNumber(this.curtainHeadData.height);
          var ancaoHeight = this.convertNumber(this.curtainHeadData.ancaoHeight);
          if (oneCurtain.NC_PART_TYPECODE == 'LT') {
            //计算帘头高 帘头的高 =（成品高-暗槽高度）÷0.1*0.0235-0.11 结果保留两位
            curtain_height = this.dosageFilter((height - ancaoHeight) * 10 * 0.0235 - 0.11);
          } else {
            curtain_height = this.dosageFilter(height * oneCurtain.NCM_HEIGHT_RATIO);
          }
        }
        this.$set(oneCurtain, "curtain_height", curtain_height);
        //总数（面积）由于开始左右转角都是0，所以不用按公式
        var dosage = this.dosageFilter(curtain_width * curtain_height);
        if (oneCurtain.NC_PART_TYPECODE == "GBD") dosage = 1; //挂绑带默认为1
        this.$set(oneCurtain, "DOSAGE", dosage);
        if (oneCurtain.NC_PART_TYPECODE == "LS") {
          //改变里衬布的
          var LCBITEM = originData.filter((item) => item.NC_PART_TYPECODE == "LCB");
          for (var j = 0; j < LCBITEM.length; j++) {
            //假设有多个里衬布的情况
            LCBITEM[j].DOSAGE = dosage;
          }
        }
        //左转角
        this.$set(oneCurtain, "LEFT_FILLET", 0);
        //右转角
        this.$set(oneCurtain, "RIGHT_FILLET", 0);
        //客户备注
        this.$set(oneCurtain, "curtain_note", "");
        //说明
        this.$set(oneCurtain, "ILLUSTRATE", "");
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
        if (res.data.length > 0 || (res.data.length == 1 && res.data[0].ITEM_NO != this.exchangeItemNow.ITEM_NO)) {
          this.exchangeItemList = res.data;
          this.totalNumber = res.count;
          //默认物料(从替换后的找)
          var defaultItem = this.curtainDataChange.filter((item) => item.NC_MODEL_ID == this.exchangeItemNow.NC_MODEL_ID);
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
    //点击替换子件
    onChangeItemClick(item) {
      if (item.ITEM_NO == this.exchangeItemNow.ITEM_NO) return;
      this.$confirm(`确认使用【${item.ITEM_NO}】替换当前【${this.exchangeItemNow.ITEM_NO}】？`, "提示", {
        confirmButtonText: "是",
        cancelButtonText: "否",
        type: "warning",
      }).then(() => {
        //替换只是更换item，现在只需要替换字段ITEM_NO，NOTE和拉边条MATERIAL_NO
        var originItem = this.curtainData.filter((item) => item.NC_MODEL_ID == this.exchangeItemNow.NC_MODEL_ID);
        if (originItem.length) {
          originItem = originItem[0];
          originItem.ITEM_NO = item.ITEM_NO;
          originItem.NOTE = item.NOTE;
          originItem.MATERIAL_NO = item.MATERIAL_NO;
        }
        //替换拉边条
        //如果需要加载，看自身是不是勾选中排序最大的
        var mlList = this.curtainData.filter((item) =>
          item.NCM_PID == originItem.NCM_PID &&
          item.NC_PART_TYPECODE != "LBT" &&
          item.curtain_choose
        );
        if (mlList.length && mlList[mlList.length - 1].ITEM_NO == originItem.ITEM_NO) {
          //改变拉边条数据
          var lbtItem = this.curtainData.filter((item) =>
            item.NCM_PID == originItem.NCM_PID &&
            item.NC_PART_TYPECODE == "LBT"
          );
          if (lbtItem.length) {
            lbtItem[0].ITEM_NO = originItem.MATERIAL_NO;
          }
        }
        //更新库存
        this.curtainData = this.getStoreData(this.curtainData);
        this.drawerShow2 = false;
        this.getRemark();
      }).catch(() => { });
    },
    //加入购物车前验证
    beforeAddCar() {
      //表头
      if (!this.curtainHeadData.width || Number(this.curtainHeadData.width) == 0) {
        this.$alert("请填写帘款【成品宽】", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return false;
      }
      if (!this.curtainHeadData.height || Number(this.curtainHeadData.height) == 0) {
        this.$alert("请填写帘款【成品高】", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return false;
      }
      if (this.curtainHeadData.ancaoHeight === "" || this.curtainHeadData.ancaoHeight === null) {
        this.$alert("请填写帘款【暗槽高】", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return false;
      }
      if (!this.curtainHeadData.location) {
        this.$alert("请填写帘款【位置】", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return false;
      }
      if (!this.curtainHeadData.setNum || Number(this.curtainHeadData.setNum) == 0) {
        this.$alert("请填写帘款【套数】", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return false;
      }
      //只看选中的
      if (!this.chooseCurtainData.length) {
        this.$alert("请至少选择一个明细！", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return false;
      }
      for (var i = 0; i < this.chooseCurtainData.length; i++) {
        var oneCurtain = this.chooseCurtainData[i];
        //编码
        if (!oneCurtain.ITEM_NO) {
          this.$alert(`${this.transPartTypeCode(oneCurtain.NC_PART_TYPECODE)}没有对应的编码，请检查！`, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return false;
        }
        //宽高
        if (oneCurtain.WIDTH_ENABLE == 2 && (!oneCurtain.curtain_width || Number(oneCurtain.curtain_width) == 0)) {
          this.$alert(`请填写${this.transPartTypeCode(oneCurtain.NC_PART_TYPECODE)}【宽】`, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return false;
        }
        if (oneCurtain.HEIGHT_ENABLE == 2 && (!oneCurtain.curtain_height || Number(oneCurtain.curtain_height) == 0)) {
          this.$alert(`请填写${this.transPartTypeCode(oneCurtain.NC_PART_TYPECODE)}【高】`, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return false;
        }
        if (Number(oneCurtain.curtain_height) < 0) {
          this.$alert(`${this.transPartTypeCode(oneCurtain.NC_PART_TYPECODE)}【高】不能小于0`, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return false;
        }
        //么术贴
        if (oneCurtain.TIE_ENABLE == 2 && !oneCurtain.NCM_MESUTIE) {
          this.$alert(`请选择${this.transPartTypeCode(oneCurtain.NC_PART_TYPECODE)}【么术贴】`, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return false;
        }
        //打开方式
        if (oneCurtain.KAIKOU_ENABLE == 2 && !oneCurtain.NCM_KAIKOU) {
          this.$alert(`请选择${this.transPartTypeCode(oneCurtain.NC_PART_TYPECODE)}【打开方式】`, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return false;
        }
        //工艺方式
        if (oneCurtain.OPERATION_ENABLE == 2 && !oneCurtain.NCM_OPERATION) {
          this.$alert(`请选择${this.transPartTypeCode(oneCurtain.NC_PART_TYPECODE)}【工艺方式】`, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return false;
        }
        //包边方式
        if (oneCurtain.BIAN_ENABLE == 2 && !oneCurtain.NCM_BIAN) {
          this.$alert(`请选择${this.transPartTypeCode(oneCurtain.NC_PART_TYPECODE)}【包边方式】`, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return false;
        }
      }
      return true;
    },
    //加入购物车
    addCurtainToShoppingCar() {
      //添加之前的验证
      if (!this.beforeAddCar()) return;
      //加入购物车
      //表头
      var head = {
        MODEL_NUMBER: this.curtainHeadData.ITEM_NO,
        WIDTH: this.curtainHeadData.width,
        HEIGHT: this.curtainHeadData.height,
        LOCATION: this.curtainHeadData.location,
        COUNT: this.curtainHeadData.setNum,
        ANCAO_HEIGHT: this.curtainHeadData.ancaoHeight,
      }
      //明细
      var details = [];
      for (var i = 0; i < this.chooseCurtainData.length; i++) {
        var oneCurtain = this.chooseCurtainData[i];
        var oneDetail = {
          PRICE: oneCurtain.PRICE,
          ITEM_ID: oneCurtain.ITEM_NO,
          WIDTH: oneCurtain.curtain_width,
          HEIGHT: oneCurtain.curtain_height,
          NOTE: oneCurtain.curtain_note,
          UNIT: oneCurtain.UNIT_NAME,
          CURTAIN_ITEM_NAME: oneCurtain.NOTE,
          CURTAIN_PART_NAME: this.transPartTypeCode(oneCurtain.NC_PART_TYPECODE),
          DOSAGE: oneCurtain.DOSAGE,
          ILLUSTRATE: oneCurtain.ILLUSTRATE,
          INLINE_NO: i + 1,
          KAIKOU: oneCurtain.NCM_KAIKOU,
          OPERATION: oneCurtain.NCM_OPERATION,
          BIAN: oneCurtain.NCM_BIAN,
          JOINT: oneCurtain.NCM_JOINT,
          WRINKLE: oneCurtain.NCM_WRINKLE,
          MAKETYPE: oneCurtain.NCM_MAKETYPE,
          MESUTIE: oneCurtain.NCM_MESUTIE,
          LEFT_FILLET: oneCurtain.LEFT_FILLET,
          RIGHT_FILLET: oneCurtain.RIGHT_FILLET,
          NCM_PID: oneCurtain.NCM_PID,
          NC_MODEL_ID: oneCurtain.NC_MODEL_ID,
          NC_TEMPLATE_ID: oneCurtain.NC_TEMPLATE_ID,
          NC_PART_TYPECODE: oneCurtain.NC_PART_TYPECODE,
          NCM_NOTE: oneCurtain.NCM_NOTE
        }
        details.push(oneDetail);
      }
      AddNewCurtainToCart({
        cid: this.cid,
        cartItem: head,
        commodities: details,
        salPromotion: this.salPromotion
      }).then(res => {
        this.$confirm("成功加入购物车！如需继续下单请修改相关信息后再次添加！", "提示", {
          confirmButtonText: "继续下单",
          cancelButtonText: "前往购物车",
          type: "warning",
        }).then(() => { })
          .catch(() => {
            this.closeToTab({
              oldUrl: "shops/newCurtainShops",
              newUrl: "shoppingCar/shopping?newCurtain",
            });
          });
        this.$root.$emit("refreshBadgeIcon", "newCurtainCount");
      }).catch(res => {
        console.log(res);
        this.$alert("加入购物车失败，请联系管理员！", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
      })
    },
    //获得窗帘的说明
    getRemark(index) {
      var curtains = [];
      if (index == undefined) {
        curtains = this.curtainData;
      } else {
        curtains.push(this.curtainData[index]);
      }
      for (var i = 0; i < curtains.length; i++) {
        var oneCurtain = curtains[i];
        //最小下单量。帘头1.帘身里衬，窗纱4
        if (oneCurtain.NC_PART_TYPECODE == 'LT') {
          if (oneCurtain.DOSAGE < 1) {
            if (oneCurtain.ILLUSTRATE.indexOf('不足1平方米。按1平方米下单量收费;') == -1) {
              oneCurtain.ILLUSTRATE += '不足1平方米。按1平方米下单量收费;';
            }
          } else {
            oneCurtain.ILLUSTRATE = oneCurtain.ILLUSTRATE.replace('不足1平方米。按1平方米下单量收费;', '');
          }
        }
        if (oneCurtain.NC_PART_TYPECODE == 'LS'|| oneCurtain.NC_PART_TYPECODE == 'LCB' || oneCurtain.NC_PART_TYPECODE == 'CS') {
          if (oneCurtain.DOSAGE < 4) {
            if (oneCurtain.ILLUSTRATE.indexOf('不足4平方米。按4平方米下单量收费;') == -1) {
              oneCurtain.ILLUSTRATE += '不足4平方米。按4平方米下单量收费;';
            }
          } else {
            oneCurtain.ILLUSTRATE = oneCurtain.ILLUSTRATE.replace('不足4平方米。按4平方米下单量收费;', '');
          }
        }
      }
    },
    //显示默认图片
    showDefaultImg(e) {
      //this.previewUrl = this.defaultUrl;
      this.havePicture = false;
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
