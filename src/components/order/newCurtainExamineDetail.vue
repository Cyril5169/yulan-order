<template>
  <el-card class="centerCard" shadow="hover">
    <div slot="header" :class="{fixHead: isFixed && isFixed2}">
      <span class="zoomLeft">
        订单号：
        <span class="zoomRight">{{ ruleForm.ORDER_NO }}</span>
      </span>
      <span class="zoomLeft">
        经办人：
        <span class="zoomRight">{{ ruleForm.LINKPERSON }}({{ ruleForm.TELEPHONE }})</span>
      </span>
      <span class="zoomLeft">
        收货人：
        <span class="zoomRight">{{ ruleForm.WL_CONTACTS }}({{ ruleForm.WL_TEL }})</span>
      </span>
      <br />
      <span class="zoomLeft">
        收货地址：
        <span class="zoomRight">{{ ruleForm.ALL_ADDRESS }}</span>
      </span>
      <span class="zoomLeft">
        订单备注：
        <span class="zoomRight">{{ ruleForm.NOTES }}</span>
      </span>
      <br />
      <span class="zoomLeft">
        玉兰处理说明：
        <span class="zoomRight">{{ ruleForm.YULAN_NOTES }}</span>
      </span>
      <br />
      <span class="zoomLeft">
        交货日期：
        <span class="zoomRight">
          <el-date-picker v-model="ruleForm.JIAOHUO_DATE" type="date" placeholder="选择时间" style="width:130px;" size="mini"
            :picker-options="pickerOptions"></el-date-picker>
        </span>
      </span>
      <span class="zoomLeft">
        兰居处理说明：
        <span class="zoomRight">
          <el-input size="mini" v-model="ruleForm.LANJU_NOTE" style="width: 500px;"></el-input>
        </span>
      </span>
      <i class="el-icon-paperclip fixed-icon" :style="{ background: isFixed2? '#eee': ''}" @click="changeFix"></i>
    </div>
    <!-- 循环订单详情 -->
    <el-table border :data="ruleForm.ORDERBODY" :row-class-name="headTableRowClassName" :expand-row-keys="expands"
      :row-key="getRowKeys">
      <el-table-column width="1" type="expand">
        <!-- 窗帘详情 -->
        <template slot-scope="scopeHead">
          <div class="curtain-list">
            <el-table :data="scopeHead.row.curtains" ref="curtainTable" class="curtain-table" border
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
              <el-table-column label="编码" width="140" header-align="center" prop="ITEM_NO">
                <template slot-scope="scope">
                  <!-- 是否可替换 -->
                  <span :class="{ 'a-link': itemCanChange(scope.row, scopeHead.$index), 'delete-cls': !scope.row.curtain_choose}"
                    @click="itemCanChange(scope.row, scopeHead.$index) && exchangeModelOrItem(scope.row, scopeHead.$index)">
                    <!-- 标定 -->
                    <template v-if="scope.row.ITEM_NO">
                      {{scope.row.ITEM_NO}}
                    </template>
                    <template v-else-if="scope.row.NC_PART_TYPECODE == 'LBT'">
                      <span style="color:red;">未维护数据!</span>
                    </template>
                    <!-- 没有模板，非标定 -->
                    <template v-else>
                      请选择
                    </template>
                  </span>
                  <!-- 是否可删/是否默认勾选 -->
                  <el-checkbox v-if="itemCanDelete(scope.row)" v-model="scope.row.curtain_choose"
                    @change="onCheckChange($event, scope.row, scopeHead.$index)"></el-checkbox>
                </template>
              </el-table-column>
              <el-table-column label="名称" width="80" header-align="center" prop="CURTAIN_ITEM_NAME">
              </el-table-column>
              <el-table-column label="制造说明" width="280" header-align="center">
                <template slot-scope="scope">
                  <!-- N个配置项逐个检测 -->
                  <!-- 宽，高 -->
                  <div class="manufacturing-ct" v-if="scope.row.WIDTH_ENABLE > 0 || scope.row.HEIGHT_ENABLE > 0">
                    <template v-if="scope.row.WIDTH_ENABLE == 1">
                      <span>【宽】: {{ scope.row.WIDTH }}m</span>
                    </template>
                    <template v-else-if="scope.row.WIDTH_ENABLE == 2">
                      <span>【宽】: <el-input v-model="scope.row.WIDTH" style="width:40px;" size="mini"
                          @input="changeOneWidthOrHeight($event, scope.$index, scopeHead.$index)" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>m
                      </span>
                    </template>
                    <template v-if="scope.row.HEIGHT_ENABLE == 1">
                      <span>【高】: {{ scope.row.HEIGHT }}m</span>
                    </template>
                    <template v-else-if="scope.row.HEIGHT_ENABLE == 2">
                      <span>【高】: <el-input v-model="scope.row.HEIGHT" style="width:40px;" size="mini"
                          @input="changeOneWidthOrHeight($event, scope.$index, scopeHead.$index)" oninput="value=value.replace(/[^\d.]/g,'')
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
                          @input="changeOneWidthOrHeight($event, scope.$index, scopeHead.$index)" oninput="value=value.replace(/[^\d.]/g,'')
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
                          @input="changeOneWidthOrHeight($event, scope.$index, scopeHead.$index)" oninput="value=value.replace(/[^\d.]/g,'')
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
                      <span>【么术贴】: {{ scope.row.MESUTIE | meshutie_filter}}</span>
                    </template>
                    <template v-else-if="scope.row.TIE_ENABLE == 2">
                      <span>【么术贴】: </span>
                      <el-dropdown trigger="click" @command="handleMesutieCommand($event, scope.$index, scopeHead.$index)">
                        <a class="a-userset">{{ scope.row.MESUTIE? scope.row.MESUTIE : '请选择' | meshutie_filter}}</a>
                        <el-dropdown-menu slot="dropdown">
                          <el-dropdown-item command="ZC">正车</el-dropdown-item>
                          <el-dropdown-item command="FC">反车</el-dropdown-item>
                        </el-dropdown-menu>
                      </el-dropdown>
                    </template>
                  </div>
                  <!-- 打开方式 -->
                  <div class="manufacturing-ct" v-if="scope.row.KAIKOU_ENABLE > 0">
                    <template v-if="scope.row.KAIKOU_ENABLE == 1">
                      <span>【打开方式】: {{ scope.row.KAIKOU | kaikou_filter }}</span>
                    </template>
                    <template v-else-if="scope.row.KAIKOU_ENABLE == 2">
                      <span>【打开方式】: </span>
                      <el-dropdown trigger="click" @command="handleKaikouCommand($event, scope.$index, scopeHead.$index)">
                        <a class="a-userset">{{ scope.row.KAIKOU? scope.row.KAIKOU : '请选择' | kaikou_filter}}</a>
                        <el-dropdown-menu slot="dropdown">
                          <el-dropdown-item command="TK">对开</el-dropdown-item>
                          <el-dropdown-item command="DK">单开</el-dropdown-item>
                          <el-dropdown-item command="SK">特殊开</el-dropdown-item>
                        </el-dropdown-menu>
                      </el-dropdown>
                    </template>
                  </div>
                  <!-- 工艺方式 -->
                  <div class="manufacturing-ct" v-if="scope.row.OPERATION_ENABLE > 0">
                    <template v-if="scope.row.OPERATION_ENABLE == 1">
                      <span>【工艺方式】: {{ scope.row.OPERATION | operation_filter }}</span>
                    </template>
                    <template v-else-if="scope.row.OPERATION_ENABLE == 2">
                      <span>【工艺方式】: </span>
                      <el-dropdown trigger="click" @command="handleOperationCommand($event, scope.$index, scopeHead.$index)">
                        <a class="a-userset">{{ scope.row.OPERATION? scope.row.OPERATION : '请选择' | operation_filter}}</a>
                        <el-dropdown-menu slot="dropdown">
                          <el-dropdown-item command="GDZ">固定褶</el-dropdown-item>
                          <el-dropdown-item command="DQ">打圈</el-dropdown-item>
                        </el-dropdown-menu>
                      </el-dropdown>
                    </template>
                  </div>
                  <!-- 包边方式 -->
                  <div class="manufacturing-ct" v-if="scope.row.BIAN_ENABLE > 0">
                    <template v-if="scope.row.BIAN_ENABLE == 1">
                      <span>【包边方式】: {{ scope.row.BIAN | bian_filter }}</span>
                    </template>
                    <template v-else-if="scope.row.BIAN_ENABLE == 2">
                      <span>【包边方式】: </span>
                      <el-dropdown trigger="click" @command="handleBianCommand($event, scope.$index, scopeHead.$index)">
                        <a class="a-userset">{{ scope.row.BIAN? scope.row.BIAN : '请选择' | bian_filter}}</a>
                        <el-dropdown-menu slot="dropdown">
                          <el-dropdown-item command="4B">4S边</el-dropdown-item>
                          <el-dropdown-item command="3B">3.0边</el-dropdown-item>
                        </el-dropdown-menu>
                      </el-dropdown>
                    </template>
                  </div>
                  <!-- 说明 -->
                  <div class="manufacturing-ct"
                    v-if="scope.row.NCM_NOTE || scope.row.JOINT || scope.row.WRINKLE || scope.row.MAKETYPE ">
                    <span>【说明】: <template v-if="scope.row.MAKETYPE">{{scope.row.MAKETYPE | makeType_filter}}<template
                          v-if="scope.row.JOINT || scope.row.WRINKLE || scope.row.NCM_NOTE">、</template></template>
                      <template v-if="scope.row.JOINT">{{scope.row.JOINT | joint_filter}}<template
                          v-if="scope.row.WRINKLE || scope.row.NCM_NOTE">、</template></template>
                      <template v-if="scope.row.WRINKLE">{{scope.row.WRINKLE }}褶<template
                          v-if="scope.row.NCM_NOTE">、</template></template>
                      <template v-if="scope.row.NCM_NOTE">{{scope.row.NCM_NOTE }}</template></span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="褶数" width="50" align="center" prop="ZE_QTY">
                <template slot-scope="scope">
                  <el-input v-if="(scope.row.curtain_level != 0 && scope.row.NC_PART_TYPECODE != 'LBT') 
                      || (scope.row.curtain_level == 0 && scope.row.NC_PART_TYPECODE != 'LT')" v-model="scope.row.ZE_QTY"
                    style="width:40px;" size="mini" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>

                  <span v-else>-</span>
                </template>
              </el-table-column>
              <!-- <el-table-column label="幅数" width="50" align="center" prop="FU_QTY">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.FU_QTY" style="width:40px;" size="mini" oninput="value=value.replace(/[^\d.]/g,'')
                           .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                           .replace('.', '$#$').replace(/\./g, '')
                           .replace('$#$', '.')
                           .slice(0,value.indexOf('.') === -1? value.length: value.indexOf('.') + 3)"></el-input>
                </template>
              </el-table-column> -->
              <el-table-column label="用量" width="100" header-align="center" prop="DOSAGE">
                <template slot-scope="scope">
                  <span v-if="scope.row.NC_PART_TYPECODE != 'LBT'">
                    <el-input v-model="scope.row.DOSAGE" style="width:45px;" size="mini"
                      @input="changeLSArea($event, scope.$index, scopeHead.$index)" oninput="value=value.replace(/[^\d.]/g,'')
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
              <el-table-column label="单价" width="60" align="center" prop="PRICE">
                <template slot-scope="scope">
                  <!-- 只有部件算钱 -->
                  <span v-if="scope.row.ITEM_NO && scope.row.curtain_level == 0">{{scope.row.PRICE}}</span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column label="总价" width="60" align="center">
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
              <el-table-column label="客户备注" align="center" prop="NOTE">
                <template slot-scope="scope">
                  <el-input v-if="scope.row.NC_PART_TYPECODE != 'LBT'" v-model="scope.row.NOTE" size="mini" type="textarea"
                    resize="none" :autosize="{ maxRows: 6 }" clearable></el-input>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column label="兰居意见" header-align="center" prop="SUGGESTION">
                <template slot-scope="scope">
                  <el-input v-if="scope.row.NC_PART_TYPECODE != 'LBT'" v-model="scope.row.SUGGESTION" size="mini" type="textarea"
                    resize="none" :autosize="{ maxRows: 6 }" clearable></el-input>
                  <span v-else>-</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="LINE_NO" label="序号" width="40"></el-table-column>
      <el-table-column align="center" prop="ITEM_NO" label="款号" width="100"></el-table-column>
      <el-table-column align="center" prop="BRAND_NAME" label="品牌" width="90"></el-table-column>
      <el-table-column align="center" prop="TYPE_NAME" label="类型" width="90"></el-table-column>
      <el-table-column prop="PRODUCTION_VERSION" align="center" label="所属版本" width="90"></el-table-column>
      <el-table-column label="销售状态" align="center" width="90">
        <template slot-scope="scope">
          <span>{{ scope.row.SALE_ID | transSaleId }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="CURTAIN_WIDTH" label="成品宽" width="80"></el-table-column>
      <el-table-column align="center" prop="CURTAIN_HEIGHT" label="成品高" width="80"></el-table-column>
      <el-table-column align="center" prop="ANCAO_HEIGHT" label="暗槽高" width="80"></el-table-column>
      <el-table-column align="center" prop="CURTAIN_ROOM_NAME" label="位置" width="100"></el-table-column>
      <el-table-column align="center" prop="QTY_REQUIRED" label="套数" width="70"></el-table-column>
      <el-table-column prop="PROMOTION" align="center" label="活动" show-overflow-tooltip></el-table-column>
      <el-table-column label="总价" align="center" width="130">
        <template slot-scope="scope">
          <span>{{ (scope.row.UNIT_PRICE * scope.row.QTY_REQUIRED) | dosageFilter }}</span>
          <span v-if="dosageFilter(allTotal(scope.$index)) != scope.row.UNIT_PRICE"
            style="color:red;">({{allTotal(scope.$index) | dosageFilter}})</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="NOTES" label="备注"></el-table-column>
    </el-table>
    <!-- 底部 -->
    <div style="float:right;margin-top:20px;height:80px;">
      <el-button @click="LanjuChange" size="medium" type="danger">兰居修改</el-button>
      <el-button size="medium" type="warning" @click="backCustomer">退回修改</el-button>
      <el-button @click="passExamine" size="medium" type="success">通过审核</el-button>
    </div>
    <div style="padding:10px;">
      <span class="timeLeft">
        创建：
        <span class="timeRight">{{ ruleForm.DATE_CRE }}</span>
      </span>
      <span v-if="ruleForm.WEB_TJ_TIME" class="timeLeft">
        提交：
        <span class="timeRight">{{ ruleForm.WEB_TJ_TIME }}</span>
      </span>
      <span class="timeLeft">
        更新：
        <span class="timeRight">{{ ruleForm.DATE_UPDATE }}</span>
      </span>
      <br />
      <span v-if="ruleForm.DATE_ACCEPT" class="timeLeft">
        接收：
        <span class="timeRight">{{ ruleForm.DATE_ACCEPT }}</span>
      </span>
      <span v-if="ruleForm.DATE_DEAL" class="timeLeft">
        处理：
        <span class="timeRight">{{ ruleForm.DATE_DEAL | datatrans }}</span>
      </span>
      <span v-if="ruleForm.USER_NO" class="timeLeft">
        处理人：
        <span class="timeRight">{{ ruleForm.USER_NO }}</span>
      </span>
    </div>
    <el-divider></el-divider>
    <div style="margin-top:0px;">
      <!-- <span style="margin-left:10px;color:red;"
          >订单修改说明：当修改数量不超过200卷时，双方可通过电话在原订单上进行修改，当修改数量超过200卷时，乙方应向甲方提供书面修改说明。</span
        >
        <br /> -->
      <span style="margin-left:10px;color:red;">注意：本订单是双方合作协议不可分割的一部分，是乙方向甲方订货的凭证，具有法律效力。</span>
      <el-divider></el-divider>
    </div>
    <div v-if="operationRecords.length > 0" style="width:800px;margin-bottom:20px;">
      <h1 style="margin-left:10px;">处理记录：</h1>
      <el-steps direction="vertical" :active="operationRecords.length" style="margin-top:10px;margin-left:20px;">
        <el-step v-for="item in operationRecords" :key="item.value" style="margin-top:1px;">
          <template slot="title">
            <div v-html="item.OPERATION_NOTE"></div>
          </template>
        </el-step>
      </el-steps>
    </div>

    <!-- 替换组件 -->
    <el-drawer :title='"【" + transPartTypeCode(exchangeModelTemplate.NC_PART_TYPECODE) + "】" + "可替换列表"' :visible.sync="drawerShow"
      :with-header="false" :size="isManager!='0'?'730px':'670px'">
      <div style="padding:0 10px;margin-bottom:10px;">
        <el-input clearable v-model.trim="modelCondition" @clear="getExchangeModelList" size="small"
          @keyup.enter.native="getExchangeModelList" placeholder="请输入物料号" style="width:300px;">
          <el-button @click="getExchangeModelList" slot="append" icon="el-icon-search">搜索</el-button>
        </el-input>
        <span style="color:grey;margin-left:10px;">*单击选择</span>
      </div>
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
                <el-table-column label="单价" width="60" align="center" prop="PRICE">
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
        <el-input clearable v-model.trim="itemCondition" @clear="getExchangeItemList" size="small"
          @keyup.enter.native="getExchangeItemList" placeholder="请输入物料号" style="width:300px;">
          <el-button @click="getExchangeItemList" slot="append" icon="el-icon-search">搜索</el-button>
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
      <el-pagination class="tc mt10" @current-change="getExchangeItemList" :current-page.sync="currentPage" :page-size="limit"
        layout="total, prev, pager, next, jumper" :total="totalNumber">
      </el-pagination>
    </el-drawer>
  </el-card>
</template>

<script>
import Cookies from "js-cookie";
import { mapActions } from "vuex";
import Axios from "axios";
import {
  getOrderDetails,
  getOperationRecord,
  getCustomerInfo,
  GetUnImportOrder,
  GetUnImportOrderByItem
} from "@/api/orderListASP";
import {
  GetPartTypeDataTable,
  GetExchangeModel,
  GetExchangeModelItem,
  newCurtainUpdateCurtainOrder,
  GetNewCurtainParams
} from "@/api/newCurtainASP";

export default {
  data() {
    return {
      isManager: "1",
      customerType: Cookies.get("customerType"),
      cus_customerType: "",
      orderNumber: '',
      operationRecords: [],
      expands: [],
      ruleForm: {
        ORDER_NO: "",
        LINKPERSON: "",
        WL_CONTACTS: "",
        WL_TEL: "",
        POST_ADDRESS: "",
        NOTES: "",
        ORDERBODY: [],
      },
      isFixed: false,
      isFixed2: !window.localStorage.getItem("curtainFixed") ||
        window.localStorage.getItem("curtainFixed") == "true",
      curtainPartTypeData: [],
      curtainParamsData: [],
      curtainParamsList: {},
      drawerShow: false,
      drawerShow2: false,
      exchangeModelList: [],
      exchangeModelTemplate: {},
      exchangeModelNow: {},
      modelCondition: "",
      exchangeItemList: [],
      exchangeItemNow: [],
      exchangeItemDefault: {},
      itemCondition: "",
      currentPage: 0,
      limit: 50,
      totalNumber: 0,
      currentIndex: -1,
      pickerOptions: {
        shortcuts: [{
          text: '7天后',
          onClick(picker) {
            const date = new Date();
            date.setTime(date.getTime() + 3600 * 1000 * 24 * 7);
            picker.$emit('pick', date);
          }
        }, {
          text: '10天后',
          onClick(picker) {
            const date = new Date();
            date.setTime(date.getTime() + 3600 * 1000 * 24 * 10);
            picker.$emit('pick', date);
          }
        }, {
          text: '15天后',
          onClick(picker) {
            const date = new Date();
            date.setTime(date.getTime() + 3600 * 1000 * 24 * 15);
            picker.$emit('pick', date);
          }
        }]
      },
      oldCurtainData: [],
      newCurtainData: [],
      deleteIds: []
    }
  },
  computed: {
    ruleFormPost() {
      var data = [];
      if (this.ruleForm) {
        data = JSON.parse(JSON.stringify(this.ruleForm));
        //去除ORDERBODY
        data.ORDERBODY = [];
      }
      return data;
    },
    orderDetailsPost() {
      var data = [];
      if (this.ruleForm.ORDERBODY) {
        data = JSON.parse(JSON.stringify(this.ruleForm.ORDERBODY));
        //去除curtains
        data.curtains = [];
      }
      return data;
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
      var typeCode = this.curtainPartTypeData.filter(item => item.NC_PART_TYPECODE == val);
      if (typeCode.length) {
        name = typeCode[0].NC_PART_NAME;
      }
      return name;
    },
    //参数
    getCurtainParams() {
      GetNewCurtainParams().then((res) => {
        this.curtainParamsData = res.data;
        //找参数
        //倍数
        var multipleParam = this.curtainParamsData.filter(item => item.NCP_TYPE == 'MULTIPLE');
        if (multipleParam.length) multipleParam = multipleParam[0];
        else console.log('没有倍数');
        //片数 对开
        var TKPianParam = this.curtainParamsData.filter(item => item.NCP_TYPE == 'PIANCOUNT' && item.NCP_CODE == 'TK');
        if (TKPianParam.length) TKPianParam = TKPianParam[0];
        else console.log('没有片数-对开');
        //片数 单开
        var DKPianParam = this.curtainParamsData.filter(item => item.NCP_TYPE == 'PIANCOUNT' && item.NCP_CODE == 'DK');
        if (DKPianParam.length) DKPianParam = DKPianParam[0];
        else console.log('没有片数-单开');
        //片数 特殊开
        var SKPianParam = this.curtainParamsData.filter(item => item.NCP_TYPE == 'PIANCOUNT' && item.NCP_CODE == 'SK');
        if (SKPianParam.length) SKPianParam = SKPianParam[0];
        else console.log('没有片数-特殊开');
        //边用量 4S
        var FSBianParam = this.curtainParamsData.filter(item => item.NCP_TYPE == 'BIANUSE' && item.NCP_CODE == '4B');
        if (FSBianParam.length) FSBianParam = FSBianParam[0];
        else console.log('没有边用量-4S');
        //边用量 3.0
        var TBBianParam = this.curtainParamsData.filter(item => item.NCP_TYPE == 'BIANUSE' && item.NCP_CODE == '3B');
        if (TBBianParam.length) TBBianParam = TBBianParam[0];
        else console.log('没有边用量-3S');
        //边用量 固定褶 4S
        var GDZFSBianParam = this.curtainParamsData.filter(item => item.NCP_TYPE == 'BIANUSE' && item.NCP_CODE == 'GDZ4B');
        if (GDZFSBianParam.length) GDZFSBianParam = GDZFSBianParam[0];
        else console.log('没有边用量-GDZ4S');
        //边用量 固定褶 3.0
        var GDZTBBianParam = this.curtainParamsData.filter(item => item.NCP_TYPE == 'BIANUSE' && item.NCP_CODE == 'GDZ3B');
        if (GDZTBBianParam.length) GDZTBBianParam = GDZTBBianParam[0];
        else console.log('没有边用量-GDZ3S');
        //边用量 打圈 4S
        var DQFSBianParam = this.curtainParamsData.filter(item => item.NCP_TYPE == 'BIANUSE' && item.NCP_CODE == 'DQ4B');
        if (DQFSBianParam.length) DQFSBianParam = DQFSBianParam[0];
        else console.log('没有边用量-GDZ4S');
        //边用量 打圈 3.0
        var DQTBBianParam = this.curtainParamsData.filter(item => item.NCP_TYPE == 'BIANUSE' && item.NCP_CODE == 'DQ3B');
        if (DQTBBianParam.length) DQTBBianParam = DQTBBianParam[0];
        else console.log('没有边用量-GDZ3S');
        //高度折边用量 4S
        var HFSBianParam = this.curtainParamsData.filter(item => item.NCP_TYPE == 'HEIGHTBIANUSE' && item.NCP_CODE == '4B');
        if (HFSBianParam.length) HFSBianParam = HFSBianParam[0];
        else console.log('没有高度折边用量-4S');
        //高度折边用量 3.0
        var HTBBianParam = this.curtainParamsData.filter(item => item.NCP_TYPE == 'HEIGHTBIANUSE' && item.NCP_CODE == '3B');
        if (HTBBianParam.length) HTBBianParam = HTBBianParam[0];
        else console.log('没有高度折边用量-3S');
        //完整褶用量 固定褶
        var GDZZheParam = this.curtainParamsData.filter(item => item.NCP_TYPE == 'ALLZHEUSE' && item.NCP_CODE == 'GDZ');
        if (GDZZheParam.length) GDZZheParam = GDZZheParam[0];
        else console.log('没有完整褶用量 固定褶');
        //完整褶用量 打圈
        var DQZheParam = this.curtainParamsData.filter(item => item.NCP_TYPE == 'ALLZHEUSE' && item.NCP_CODE == 'DQ');
        if (DQZheParam.length) DQZheParam = DQZheParam[0];
        else console.log('没有完整褶用量 打圈');
        //2.8宽幅最大褶数 固定褶
        var WGDZMaxZheParam = this.curtainParamsData.filter(item => item.NCP_TYPE == '28WIDTHZHE' && item.NCP_CODE == 'GDZ');
        if (WGDZMaxZheParam.length) WGDZMaxZheParam = WGDZMaxZheParam[0];
        else console.log('没有2.8宽幅最大褶数 固定褶');
        //2.8宽幅最大褶数 打圈
        var WDQMaxZheParam = this.curtainParamsData.filter(item => item.NCP_TYPE == '28WIDTHZHE' && item.NCP_CODE == 'DQ');
        if (WDQMaxZheParam.length) WDQMaxZheParam = WDQMaxZheParam[0];
        else console.log('没有2.8宽幅最大褶数 打圈');
        //1.4窄幅最大褶数 固定褶
        var GDZMaxZheParam = this.curtainParamsData.filter(item => item.NCP_TYPE == '14ZHE' && item.NCP_CODE == 'GDZ');
        if (GDZMaxZheParam.length) GDZMaxZheParam = GDZMaxZheParam[0];
        else console.log('没有1.4宽幅最大褶数 固定褶');
        //1.4窄宽幅最大褶数 打圈
        var DQMaxZheParam = this.curtainParamsData.filter(item => item.NCP_TYPE == '14ZHE' && item.NCP_CODE == 'DQ');
        if (DQMaxZheParam.length) DQMaxZheParam = DQMaxZheParam[0];
        else console.log('没有1.4宽幅最大褶数 打圈');
        //下脚高
        var xiajiaoHeightParam = this.curtainParamsData.filter(item => item.NCP_TYPE == 'XIAJIAOHEIGHT');
        if (xiajiaoHeightParam.length) xiajiaoHeightParam = xiajiaoHeightParam[0];
        else console.log('没有下脚高');

        this.curtainParamsList = {
          multipleParam: multipleParam,
          TKPianParam: TKPianParam,
          DKPianParam: DKPianParam,
          SKPianParam: SKPianParam,
          FSBianParam: FSBianParam,
          TBBianParam: TBBianParam,
          GDZFSBianParam: GDZFSBianParam,
          GDZTBBianParam: GDZTBBianParam,
          DQFSBianParam: DQFSBianParam,
          DQTBBianParam: DQTBBianParam,
          HFSBianParam: HFSBianParam,
          HTBBianParam: HTBBianParam,
          GDZZheParam: GDZZheParam,
          DQZheParam: DQZheParam,
          WGDZMaxZheParam: WGDZMaxZheParam,
          WDQMaxZheParam: WDQMaxZheParam,
          GDZMaxZheParam: GDZMaxZheParam,
          DQMaxZheParam: DQMaxZheParam,
          xiajiaoHeightParam: xiajiaoHeightParam
        }
      });
    },
    //找到需要加载拉边条的面料
    getLBTMLItem() {
      var lbtmlItem = undefined;
      //先找到帘身
      var lsItem = this.ruleForm.ORDERBODY[this.currentIndex].curtains.filter(item => item.NC_PART_TYPECODE == 'LS');
      if (lsItem.length) {
        lsItem = lsItem[0];
        //找到帘身下面的子件
        var mlList = this.ruleForm.ORDERBODY[this.currentIndex].curtains.filter(item =>
          item.NCM_PID == lsItem.NC_MODEL_ID &&
          item.NC_PART_TYPECODE != "LBT" &&
          item.curtain_choose
        );
        //按照2褶，1褶，主布的顺序找
        lbtmlItem = mlList.filter(item => item.NC_PART_TYPECODE == 'PB2');
        if (lbtmlItem.length) {
          lbtmlItem = lbtmlItem[0];
        } else {
          lbtmlItem = mlList.filter(item => item.NC_PART_TYPECODE == 'PB1');
          if (lbtmlItem.length) {
            lbtmlItem = lbtmlItem[0];
          } else {
            lbtmlItem = mlList.filter(item => item.NC_PART_TYPECODE == 'ZB');
            if (lbtmlItem.length) {
              lbtmlItem = lbtmlItem[0];
            }
          }
        }
      }
      return lbtmlItem;
    },
    allTotal(index) {
      let totalMoney = 0;
      for (var i = 0; i < this.ruleForm.ORDERBODY[index].curtains.length; i++) {
        var oneCurtain = this.ruleForm.ORDERBODY[index].curtains[i];
        if (oneCurtain.curtain_choose)
          totalMoney += this.oneTotal(oneCurtain);
      }
      return totalMoney;
    },
    getRowKeys(row) {
      return row.LINE_NO;
    },
    getCustomer() {
      var data = {
        cid: this.ruleForm.CUSTOMER_CODE,
        companyId: this.ruleForm.CUSTOMER_CODE,
      };
      getCustomerInfo(data, { loading: false }).then((res) => {
        this.cus_customerType = res.data.CUSTOMER_TYPE;
      });
    },
    getDetail() {
      this.expands = [];
      getOrderDetails({ orderNo: this.orderNumber }).then((res) => {
        this.ruleForm = res.data[0];
        if (this.ruleForm.JIAOHUO_DATE == '9999/12/31 00:00:00') this.ruleForm.JIAOHUO_DATE = "";
        this.getCustomer();
        this.dealCurtainData();
        getOperationRecord({ orderNo: this.orderNumber }, { loading: false }).then((res) => {
          this.operationRecords = res.data;
        });
      });
    },
    //处理窗帘数据
    dealCurtainData() {
      for (var i = 0; i < this.ruleForm.ORDERBODY.length; i++) {
        var detail = this.ruleForm.ORDERBODY[i];

        for (var j = 0; j < detail.curtains.length; j++) {
          var oneCurtain = detail.curtains[j];
          //窗帘层级
          var level = 0;
          var NCM_PID = oneCurtain.NCM_PID;
          while (NCM_PID != 0) {
            var temp = detail.curtains.filter(item => item.NC_MODEL_ID == NCM_PID);
            if (temp.length) {
              NCM_PID = temp[0].NCM_PID;
              level++;
            }
          }
          this.$set(oneCurtain, "curtain_level", level);
          //选中标识(这里既然有那肯定都是选中的)
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
            var temp = detail.curtain_change.filter(item => item.NC_MODEL_ID == NCM_PID);
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
            var LCBITEM = detail.curtain_change.filter(item => item.NC_PART_TYPECODE == "LCB");
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
      }
      for (var i = 0; i < this.ruleForm.ORDERBODY.length; i++) {
        this.expands.push(this.ruleForm.ORDERBODY[i].LINE_NO);
      }
    },
    //把model数据转换为comodity数据
    dealInsertData(data) {
      var returnData = {
        ...data,
        ORDER_NO: this.ruleForm.ORDERBODY[this.currentIndex].ORDER_NO,
        ORDER_ITEM_ID: this.ruleForm.ORDERBODY[this.currentIndex].curtains[0].ORDER_ITEM_ID,
        PRICE: data.PRICE,
        ITEM_ID: data.ITEM_NO,
        WIDTH: data.curtain_width,
        HEIGHT: data.curtain_height,
        NOTE: "",
        UNIT: data.UNIT_NAME,
        CURTAIN_ITEM_NAME: data.NOTE,
        CURTAIN_PART_NAME: this.transPartTypeCode(data.NC_PART_TYPECODE),
        DOSAGE: data.DOSAGE,
        ILLUSTRATE: data.ILLUSTRATE,
        INLINE_NO: 0,
        LINE_NO: this.ruleForm.ORDERBODY[this.currentIndex].LINE_NO,
        KAIKOU: data.NCM_KAIKOU,
        OPERATION: data.NCM_OPERATION,
        BIAN: data.NCM_BIAN,
        JOINT: data.NCM_JOINT,
        WRINKLE: data.NCM_WRINKLE,
        MAKETYPE: data.NCM_MAKETYPE,
        MESUTIE: data.NCM_MESUTIE,
        LEFT_FILLET: data.LEFT_FILLET,
        RIGHT_FILLET: data.RIGHT_FILLET,
      }
      return returnData;
    },
    //查找库存
    getStoreData(originData) {
      for (var i = 0; i < originData.length; i++) {
        var oneCurtain = originData[i];
        if (!oneCurtain.ITEM_NO) continue;
        if (oneCurtain.curtain_level == 0) continue;
        //库存
        var postData = {
          token: "兰居尚品",
          code: oneCurtain.ITEM_NO,
        };
        Axios.defaults.withCredentials = false;
        Axios.post("http://ljsp.ubxiu.com:8098/api/getXXDMX", postData, {
          params: postData,
          loading: false,
        }).then((res) => {
          if (res.data && res.data.data) {
            var itemNo = res.data.data.code;
            GetUnImportOrderByItem({ itemNo: itemNo }, { loading: false }).then(res2 => {
              var store_charge = "";
              var kucun = res.data.data.kucun ? res.data.data.kucun : 0;
              var dinghuoshu = res.data.data.dinghuoshu ? res.data.data.dinghuoshu : 0;
              var xiaxian = res.data.data.xiaxian ? res.data.data.xiaxian : 0;
              var ddz = 0;
              if (res2.length) ddz = res2[0].DOSAGE;
              var store_num = kucun - dinghuoshu - ddz;
              if (store_num >= xiaxian) {
                store_charge = "充足";
              } else if (store_num > 0 && store_num < xiaxian) {
                store_charge = "量少待查";
              } else if (store_num < 0) {
                store_charge = "欠料待审";
              }
              var data = originData.filter(item => item.ITEM_NO == itemNo);
              if (data.length) {
                for (var j = 0; j < data.length; j++) {
                  data[j].curtain_store = store_charge;
                }
              }
            })
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
    //改变单个宽或者高
    changeOneWidthOrHeight(val, index1, index) {
      this.currentIndex = index;
      var oneCurtain = this.ruleForm.ORDERBODY[this.currentIndex].curtains[index1];
      var width = this.convertNumber(oneCurtain.WIDTH);
      var height = this.convertNumber(oneCurtain.HEIGHT);
      var left_fillet = this.convertNumber(oneCurtain.LEFT_FILLET);
      var right_fillet = this.convertNumber(oneCurtain.RIGHT_FILLET);
      if (oneCurtain.NC_PART_TYPECODE == "LT") {
        //计算帘头用量 帘头用量=（帘头宽+左转角+右转角）*帘头高
        oneCurtain.DOSAGE = this.dosageFilter((width + left_fillet + right_fillet) * height);
      } else {
        oneCurtain.DOSAGE = this.dosageFilter(width * height);
      }
      if (oneCurtain.NC_PART_TYPECODE == "LS") {
        //改变里衬布的
        var LCBITEM = this.ruleForm.ORDERBODY[this.currentIndex].curtains.filter(item => item.NC_PART_TYPECODE == "LCB");
        for (var i = 0; i < LCBITEM.length; i++) {
          //假设有多个里衬布的情况
          LCBITEM[i].DOSAGE = oneCurtain.DOSAGE;
          this.getRemark(this.ruleForm.ORDERBODY[this.currentIndex].curtains.indexOf(LCBITEM[i]));
        }
      }
      this.getRemark(index1);
      //计算明细用量
      this.calculateChildrenDosage(index1);
    },
    //计算明细用量
    calculateChildrenDosage(index) {
      var orderDetail = this.ruleForm.ORDERBODY[this.currentIndex];
      var curtains = this.ruleForm.ORDERBODY[this.currentIndex].curtains;
      var oneCurtain = this.ruleForm.ORDERBODY[this.currentIndex].curtains[index];

      //for (var i = 0; i < curtains.length; i++) {
      //var oneCurtain = curtains[i];
      //集中参数
      //片数
      var pianParam = null;
      if (oneCurtain.KAIKOU == 'TK') pianParam = this.curtainParamsList.TKPianParam;
      else if (oneCurtain.KAIKOU == 'DK') pianParam = this.curtainParamsList.DKPianParam;
      else if (oneCurtain.KAIKOU == 'SK') pianParam = this.curtainParamsList.SKPianParam;
      //边用量
      var bianParam = null;
      if (oneCurtain.OPERATION == 'GDZ') {
        if (oneCurtain.BIAN == '4B') bianParam = this.curtainParamsList.GDZFSBianParam;
        else if (oneCurtain.BIAN == '3B') bianParam = this.curtainParamsList.GDZTBBianParam;
      } else if (oneCurtain.OPERATION == "DQ") {
        if (oneCurtain.BIAN == '4B') bianParam = this.curtainParamsList.DQFSBianParam;
        else if (oneCurtain.BIAN == '3B') bianParam = this.curtainParamsList.DQTBBianParam;
      }
      //高度折边用量
      var HightBianParam = null;
      if (oneCurtain.BIAN == '4B') HightBianParam = this.curtainParamsList.HFSBianParam;
      else if (oneCurtain.BIAN == '3B') HightBianParam = this.curtainParamsList.HTBBianParam;
      //完整褶用量
      var zheParam = null;
      if (oneCurtain.OPERATION == 'GDZ') zheParam = this.curtainParamsList.GDZZheParam;
      else if (oneCurtain.OPERATION == 'DQ') zheParam = this.curtainParamsList.DQZheParam;
      //最大褶数
      var maxzheParam = null;

      var width = this.convertNumber(oneCurtain.WIDTH);
      var height = this.convertNumber(oneCurtain.HEIGHT);
      //帘身明细计算
      if (oneCurtain.NC_PART_TYPECODE == 'LS') {
        var singleZhe = 0;
        if (oneCurtain.OPERATION == "GDZ") {
          //固定褶 单片褶数 = 进位取整(帘身宽 * 1.13 / 0.15 / 片数) + 1
          singleZhe = Math.ceil(width * 1.13 / 0.15 / pianParam.NCP_VALUE) + 1;
        }
        else if (oneCurtain.OPERATION == "DQ") {
          //打圈 单片褶数 = 四舍五入(帘身宽 * 7 / 片数, 0)
          singleZhe = Math.round(width * 7 / pianParam.NCP_VALUE);
        }
        oneCurtain.ZE_QTY = singleZhe;
        var pb1Zhe = 0;
        var pb2Zhe = 0;

        //帘身-配布1
        var pb1Commodity = curtains.filter(item => item.NCM_PID == oneCurtain.NC_MODEL_ID && item.NC_PART_TYPECODE == "PB1");
        if (pb1Commodity.length) {
          pb1Commodity = pb1Commodity[0];
          if (pb1Commodity.ITEM_NO) {
            if (pb1Commodity.FIX_GRADE > 1600) {
              //2.8宽幅
              if (oneCurtain.OPERATION == "GDZ") maxzheParam = this.curtainParamsList.WGDZMaxZheParam;
              else if (oneCurtain.OPERATION == "DQ") maxzheParam = this.curtainParamsList.WDQMaxZheParam;
            } else {
              //1.4窄幅
              if (oneCurtain.OPERATION == "GDZ") maxzheParam = this.curtainParamsList.GDZMaxZheParam;
              else if (oneCurtain.OPERATION == "DQ") maxzheParam = this.curtainParamsList.DQMaxZheParam;
            }
            //配布1褶数 = 配布1下单褶数 * 片数
            pb1Zhe = pb1Commodity.WRINKLE;
            pb1Commodity.ZE_QTY = pb1Commodity.WRINKLE * pianParam.NCP_VALUE;
            //幅数和用量区分定宽定高
            if (orderDetail.FIX_TYPE == "01") {
              //定宽
              //配布1幅数 = 配布1褶数 / 最大褶数
              pb1Commodity.FU_QTY = this.dosageFilter(pb1Commodity.ZE_QTY / maxzheParam.NCP_VALUE);
              //配布1用量 = （帘身高 + 高度折边用量）* 配布1幅数（进位取整）
              pb1Commodity.DOSAGE = this.dosageFilter((height + HightBianParam.NCP_VALUE) * Math.ceil(pb1Commodity.FU_QTY));
            }
            else if (orderDetail.FIX_TYPE == "02") {
              //定高
              //配布1用量 = 配布1褶数 * 完整褶用量
              pb1Commodity.DOSAGE = this.dosageFilter(pb1Commodity.ZE_QTY * zheParam.NCP_VALUE);
            }
          } else {
            pb1Commodity.ZE_QTY = 0;
            pb1Commodity.FU_QTY = 0;
            pb1Commodity.DOSAGE = 0;
          }
        }

        //帘身-配布2
        var pb2Commodity = curtains.filter(item => item.NCM_PID == oneCurtain.NC_MODEL_ID && item.NC_PART_TYPECODE == "PB2");
        if (pb2Commodity.length) {
          pb2Commodity = pb2Commodity[0];
          if (pb2Commodity.ITEM_NO) {
            if (pb2Commodity.FIX_GRADE > 1600) {
              //2.8宽幅
              if (oneCurtain.OPERATION == "GDZ") maxzheParam = this.curtainParamsList.WGDZMaxZheParam;
              else if (oneCurtain.OPERATION == "DQ") maxzheParam = this.curtainParamsList.WDQMaxZheParam;
            } else {
              //1.4窄幅
              if (oneCurtain.OPERATION == "GDZ") maxzheParam = this.curtainParamsList.GDZMaxZheParam;
              else if (oneCurtain.OPERATION == "DQ") maxzheParam = this.curtainParamsList.DQMaxZheParam;
            }
            //配布2褶数 = 配布2下单褶数 * 片数
            pb2Zhe = pb2Commodity.WRINKLE;
            pb2Commodity.ZE_QTY = pb2Commodity.WRINKLE * pianParam.NCP_VALUE;
            //幅数和用量区分定宽定高
            if (orderDetail.FIX_TYPE == "01") {
              //定宽
              //配布2幅数 = 配布2褶数 / 最大褶数
              pb2Commodity.FU_QTY = this.dosageFilter(pb2Commodity.ZE_QTY / maxzheParam.NCP_VALUE);
              //配布2用量 = （帘身高 + 高度折边用量）* 配布2幅数（进位取整）
              pb2Commodity.DOSAGE = this.dosageFilter((height + HightBianParam.NCP_VALUE) * Math.ceil(pb2Commodity.FU_QTY));
            }
            else if (orderDetail.FIX_TYPE == "02") {
              //定高
              //配布2用量 = 配布2褶数 * 完整褶用量 + 边用量 * 片数
              pb2Commodity.DOSAGE = this.dosageFilter(pb2Commodity.ZE_QTY * zheParam.NCP_VALUE + bianParam.NCP_VALUE * pianParam.NCP_VALUE);
            }
          } else {
            pb2Commodity.ZE_QTY = 0;
            pb2Commodity.FU_QTY = 0;
            pb2Commodity.DOSAGE = 0;
          }
        }

        //帘身-主布
        var zbCommodity = curtains.filter(item => item.NCM_PID == oneCurtain.NC_MODEL_ID && item.NC_PART_TYPECODE == "ZB");
        if (zbCommodity.length) {
          zbCommodity = zbCommodity[0];
          if (zbCommodity.ITEM_NO) {
            if (zbCommodity.FIX_GRADE > 1600) {
              //2.8宽幅
              if (oneCurtain.OPERATION == "GDZ") maxzheParam = this.curtainParamsList.WGDZMaxZheParam;
              else if (oneCurtain.OPERATION == "DQ") maxzheParam = this.curtainParamsList.WDQMaxZheParam;
            } else {
              //1.4窄幅
              if (oneCurtain.OPERATION == "GDZ") maxzheParam = this.curtainParamsList.GDZMaxZheParam;
              else if (oneCurtain.OPERATION == "DQ") maxzheParam = this.curtainParamsList.DQMaxZheParam;
            }
            //主布褶数 = （单片褶数 - 配布1下单褶数 - 配布2下单褶数）* 片数
            zbCommodity.ZE_QTY = (singleZhe - pb1Zhe - pb2Zhe) * pianParam.NCP_VALUE;
            //幅数和用量区分定宽定高
            if (orderDetail.FIX_TYPE == "01") {
              //定宽
              //主布幅数 = 主布褶数 / 最大褶数
              zbCommodity.FU_QTY = this.dosageFilter(zbCommodity.ZE_QTY / maxzheParam.NCP_VALUE);
              //主布用量 = （帘身高 + 高度折边用量）* 主布幅数（进位取整）
              zbCommodity.DOSAGE = this.dosageFilter((height + HightBianParam.NCP_VALUE) * Math.ceil(zbCommodity.FU_QTY));
            }
            else if (orderDetail.FIX_TYPE == "02") {
              //定高
              //主布用量 = 主布褶数 * 完整褶用量 + 边用量（有配布*1，无配布*2） * 片数
              var pbCount = 2;
              if (pb1Commodity.length || pb2Commodity.length) pbCount = 1;
              zbCommodity.DOSAGE = this.dosageFilter(zbCommodity.ZE_QTY * zheParam.NCP_VALUE + bianParam.NCP_VALUE * pbCount * pianParam.NCP_VALUE);
            }
          } else {
            zbCommodity.ZE_QTY = 0;
            zbCommodity.FU_QTY = 0;
            zbCommodity.DOSAGE = 0;
          }
        }

        //帘身-花边
        var hbCommodity = curtains.filter(item => item.NCM_PID == oneCurtain.NC_MODEL_ID && item.NC_PART_TYPECODE == "XHB");
        if (hbCommodity.length) {
          hbCommodity = hbCommodity[0];
          if (hbCommodity.ITEM_NO) {
            if (hbCommodity.JOINT == "SP") {
              //竖拼花边用量 = （帘身高 + 高度折边用量）* 片数
              hbCommodity.DOSAGE = this.dosageFilter((height + HightBianParam.NCP_VALUE) * pianParam.NCP_VALUE);
            }
            else if (hbCommodity.JOINT == "HP") {
              //横拼花边用量 = （单片褶数 * 固定褶用量 + 边用量 * 2）* 片数
              hbCommodity.DOSAGE = this.dosageFilter((singleZhe * zheParam.NCP_VALUE + bianParam.NCP_VALUE * 2) * pianParam.NCP_VALUE);
            }
          } else {
            hbCommodity.ZE_QTY = 0;
            hbCommodity.FU_QTY = 0;
            hbCommodity.DOSAGE = 0;
          }
        }

        //里衬
        var lcbCommodity = curtains.filter(item => item.NC_PART_TYPECODE == "LCB");
        if (lcbCommodity.length) {
          lcbCommodity = lcbCommodity[0];
          //找里衬下面的主布
          var lczbCommodity = curtains.filter(item => item.NCM_PID == lcbCommodity.NC_MODEL_ID && item.NC_PART_TYPECODE == "ZB");
          if (lczbCommodity.length) {
            lczbCommodity = lczbCommodity[0];
            //里衬褶数 = 单片褶数 * 片数
            lczbCommodity.ZE_QTY = singleZhe * pianParam.NCP_VALUE;
            //里衬用量
            if (orderDetail.CURTAIN_HEIGHT > 2.7) {
              if (lczbCommodity.FIX_GRADE > 1600) {
                //2.8宽幅
                if (oneCurtain.OPERATION == "GDZ") maxzheParam = this.curtainParamsList.WGDZMaxZheParam;
                else if (oneCurtain.OPERATION == "DQ") maxzheParam = this.curtainParamsList.WDQMaxZheParam;
              } else {
                //1.4窄幅
                if (oneCurtain.OPERATION == "GDZ") maxzheParam = this.curtainParamsList.GDZMaxZheParam;
                else if (oneCurtain.OPERATION == "DQ") maxzheParam = this.curtainParamsList.DQMaxZheParam;
              }
              //帘身高>2.7定宽 = (帘身高 + 高度折边用量- 0.03) * 进位取整(里衬褶数 / 最大褶数)
              lczbCommodity.DOSAGE = this.dosageFilter((height + HightBianParam.NCP_VALUE - 0.03) * Math.ceil(lczbCommodity.ZE_QTY / maxzheParam.NCP_VALUE));
            }
            else {
              //帘身高<=2.7定高 = 里衬褶数 * 完整褶用量
              lczbCommodity.DOSAGE = this.dosageFilter(lczbCommodity.ZE_QTY * zheParam.NCP_VALUE);
            }
          }
        }
      }
      //窗纱明细计算
      else if (oneCurtain.NC_PART_TYPECODE == 'CS') {
        var singleZhe = 0;
        if (oneCurtain.OPERATION == "GDZ") {
          //固定褶 单片褶数 = 进位取整(帘身宽 * 1.13 / 0.15 / 片数) + 1
          singleZhe = Math.ceil(width * 1.13 / 0.15 / pianParam.NCP_VALUE) + 1;
        }
        else if (oneCurtain.OPERATION == "DQ") {
          //打圈 单片褶数 = 四舍五入(帘身宽 * 7 / 片数, 0)
          singleZhe = Math.round(width * 7 / pianParam.NCP_VALUE);
        }
        oneCurtain.ZE_QTY = singleZhe;

        //窗纱-主布
        var zbCommodity = curtains.filter(item => item.NCM_PID == oneCurtain.NC_MODEL_ID && item.NC_PART_TYPECODE == "ZB");
        if (zbCommodity.length) {
          zbCommodity = zbCommodity[0];
          if (zbCommodity.ITEM_NO) {
            if (zbCommodity.FIX_GRADE > 1600) {
              //2.8宽幅
              if (oneCurtain.OPERATION == "GDZ") maxzheParam = this.curtainParamsList.WGDZMaxZheParam;
              else if (oneCurtain.OPERATION == "DQ") maxzheParam = this.curtainParamsList.WDQMaxZheParam;
            } else {
              //1.4窄幅
              if (oneCurtain.OPERATION == "GDZ") maxzheParam = this.curtainParamsList.GDZMaxZheParam;
              else if (oneCurtain.OPERATION == "DQ") maxzheParam = this.curtainParamsList.DQMaxZheParam;
            }
            //主布褶数 = 单片褶数 * 片数
            zbCommodity.ZE_QTY = singleZhe * pianParam.NCP_VALUE;
            //幅数和用量区分定宽定高
            if (orderDetail.FIX_TYPE == "01") {
              //定宽
              //主布幅数 = 主布褶数 / 最大褶数
              zbCommodity.FU_QTY = this.dosageFilter(zbCommodity.ZE_QTY / maxzheParam.NCP_VALUE);
              //主布用量 = （窗纱高 + 高度折边用量）* 0.8 * 主布幅数（进位取整）
              zbCommodity.DOSAGE = this.dosageFilter((height + HightBianParam.NCP_VALUE) * 0.8 * Math.ceil(zbCommodity.FU_QTY));
            }
            else if (orderDetail.FIX_TYPE == "02") {
              //定高
              //主布用量 = 主布褶数 * 完整褶用量 + 边用量 * 2 * 片数
              zbCommodity.DOSAGE = this.dosageFilter(zbCommodity.ZE_QTY * zheParam.NCP_VALUE + bianParam.NCP_VALUE * 2 * pianParam.NCP_VALUE);
            }
          } else {
            zbCommodity.ZE_QTY = 0;
            zbCommodity.FU_QTY = 0;
            zbCommodity.DOSAGE = 0;
          }
        }

        //窗纱-配布
        var pbCommodity = curtains.filter(item => item.NCM_PID == oneCurtain.NC_MODEL_ID && item.NC_PART_TYPECODE == "PB");
        if (pbCommodity.length) {
          pbCommodity = pbCommodity[0];
          if (pbCommodity.ITEM_NO) {
            //配布褶数 = 主布褶数
            pbCommodity.ZE_QTY = zbCommodity.ZE_QTY;
            //幅数和用量区分定宽定高
            if (orderDetail.FIX_TYPE == "01") {
              //定宽
              //配布幅数 = 主布幅数
              pbCommodity.FU_QTY = zbCommodity.FU_QTY;
              //配布用量 = 窗纱高 / 5 * 配布幅数（进位取整）
              pbCommodity.DOSAGE = this.dosageFilter(height / 5 * Math.ceil(pbCommodity.FU_QTY));
            }
            else if (orderDetail.FIX_TYPE == "02") {
              //定高
              //配布用量 = 主布用量 / 2
              pbCommodity.DOSAGE = this.dosageFilter(zbCommodity.DOSAGE / 2);
            }
          } else {
            pbCommodity.ZE_QTY = 0;
            pbCommodity.FU_QTY = 0;
            pbCommodity.DOSAGE = 0;
          }
        }

        //窗纱-花边
        var hbCommodity = curtains.filter(item => item.NCM_PID == oneCurtain.NC_MODEL_ID && item.NC_PART_TYPECODE == "XHB");
        if (hbCommodity.length) {
          hbCommodity = hbCommodity[0];
          if (hbCommodity.ITEM_NO) {
            if (hbCommodity.JOINT == "SP") {
              //竖拼花边用量 = （窗纱高 + 高度折边用量）* 片数
              hbCommodity.DOSAGE = this.dosageFilter((height + HightBianParam.NCP_VALUE) * pianParam.NCP_VALUE);
            }
            else if (hbCommodity.JOINT == "HP") {
              //横拼花边用量 = （单片褶数 * 固定褶用量 + 边用量 * 2）* 片数
              hbCommodity.DOSAGE = this.dosageFilter((singleZhe * zheParam.NCP_VALUE + bianParam.NCP_VALUE * 2) * pianParam.NCP_VALUE);
            }
          } else {
            hbCommodity.ZE_QTY = 0;
            hbCommodity.FU_QTY = 0;
            hbCommodity.DOSAGE = 0;
          }
        }

        //窗纱-下脚配布
        var xjCommodity = curtains.filter(item => item.NCM_PID == oneCurtain.NC_MODEL_ID && item.NC_PART_TYPECODE == "XJ");
        if (xjCommodity.length) {
          xjCommodity = xjCommodity[0];
          if (xjCommodity.ITEM_NO) {
            //下脚配布褶数 = 主布褶数
            xjCommodity.ZE_QTY = zbCommodity.ZE_QTY;
            //幅数和用量区分定宽定高
            if (orderDetail.FIX_TYPE == "01") {
              //定宽
              //下脚配布幅数 = 主布幅数
              xjCommodity.FU_QTY = zbCommodity.FU_QTY;
              //下脚配布用量 = 0.23 * 下脚配布幅数（进位取整）
              xjCommodity.DOSAGE = this.dosageFilter(0.23 * Math.ceil(xjCommodity.FU_QTY));
              //有下脚时，主布用量 = （窗纱高 - 下脚高）* 主布幅数（进位取整）
              zbCommodity.DOSAGE = this.dosageFilter((height - this.curtainParamsList.xiajiaoHeightParam.NCP_VALUE) * Math.ceil(zbCommodity.FU_QTY));
            }
            else if (orderDetail.FIX_TYPE == "02") {
              //定高
              //下脚配布用量 = 主布用量 / 片数
              xjCommodity.DOSAGE = this.dosageFilter(zbCommodity.DOSAGE / pianParam.NCP_VALUE);
            }
          } else {
            xjCommodity.ZE_QTY = 0;
            xjCommodity.FU_QTY = 0;
            xjCommodity.DOSAGE = 0;
          }
        }

        //窗纱没有配布也没有下脚时
        if (!pbCommodity.ID && !xjCommodity.ID) {
          if (orderDetail.FIX_TYPE == "01" && zbCommodity.ITEM_NO) {
            //主布用量 = (窗纱高 + 高度折边用量) * 主布幅数(进位取整)
            zbCommodity.DOSAGE = this.dosageFilter((height + HightBianParam.NCP_VALUE) * Math.ceil(zbCommodity.FU_QTY));
          }
        }
      }
      //}
    },
    //直接改变帘身用量
    changeLSArea(val, index1, index) {
      this.currentIndex = index;
      var oneCurtain = this.ruleForm.ORDERBODY[this.currentIndex].curtains[index1];
      if (oneCurtain.NC_PART_TYPECODE == "LS") {
        //改变里衬布的
        var LCBITEM = this.ruleForm.ORDERBODY[this.currentIndex].curtains.filter(item => item.NC_PART_TYPECODE == "LCB");
        for (var i = 0; i < LCBITEM.length; i++) {
          //假设有多个里衬布的情况
          LCBITEM[i].DOSAGE = oneCurtain.DOSAGE;
          this.getRemark(this.ruleForm.ORDERBODY[this.currentIndex].curtains.indexOf(LCBITEM[i]));
        }
      }
      this.getRemark(index1);
    },
    //一个子件的总价
    oneTotal(row) {
      var price = row.PRICE;
      //最小下单量 帘头1.帘身里衬，窗纱4
      var DOSAGE = row.DOSAGE ? this.convertNumber(row.DOSAGE) : 0;
      if (row.NC_PART_TYPECODE == 'LT' && DOSAGE < 1 && DOSAGE > 0) {
        DOSAGE = 1;
      } else if ((row.NC_PART_TYPECODE == 'LS' || row.NC_PART_TYPECODE == 'LCB' || row.NC_PART_TYPECODE == 'CS') && DOSAGE < 4 && DOSAGE > 0) {
        DOSAGE = 4;
      }
      price = price.mul(DOSAGE)
      return price;
    },
    //改变么术贴
    handleMesutieCommand(common, index1, index) {
      this.currentIndex = index;
      var oneCurtain = this.ruleForm.ORDERBODY[this.currentIndex].curtains[index1];
      oneCurtain.MESUTIE = common;
    },
    //改变打开方式改变明细用量
    handleKaikouCommand(common, index1, index) {
      this.currentIndex = index;
      var oneCurtain = this.ruleForm.ORDERBODY[this.currentIndex].curtains[index1];
      oneCurtain.KAIKOU = common;
      this.calculateChildrenDosage(index1);
    },
    //改变工艺方式改变明细用量
    handleOperationCommand(common, index1, index) {
      this.currentIndex = index;
      var oneCurtain = this.ruleForm.ORDERBODY[this.currentIndex].curtains[index1];
      oneCurtain.OPERATION = common;
      this.calculateChildrenDosage(index1);
    },
    //处理拉边条和明细用量
    handleBianCommand(common, index1, index) {
      this.currentIndex = index;
      var oneCurtain = this.ruleForm.ORDERBODY[this.currentIndex].curtains[index1];
      if (oneCurtain.NC_PART_TYPECODE == 'LS') {
        if (common == "4B" && oneCurtain.BIAN != "4B") {
          //显示拉边条
          //先看看当前数据有没有这个拉边条，有的话应该是bug
          var lbtItemNow = this.ruleForm.ORDERBODY[this.currentIndex].curtains.filter(item => item.NCM_PID == oneCurtain.NC_MODEL_ID && item.NC_PART_TYPECODE == "LBT");
          if (lbtItemNow.length) return;
          //在修改后的数据中找到拉边条数据并push进去
          var lbtItem = this.ruleForm.ORDERBODY[this.currentIndex].curtain_change.filter(item => item.NCM_PID == oneCurtain.NC_MODEL_ID && item.NC_PART_TYPECODE == "LBT");
          if (lbtItem.length) {
            lbtItem = lbtItem[0]; //只取第一个拉边条（按理应该只有一个）
            lbtItem = this.dealInsertData(lbtItem);
            this.ruleForm.ORDERBODY[this.currentIndex].curtains.push({ ...lbtItem });
            //找到需要显示拉边条的面料
            var lbtmlItem = this.getLBTMLItem();
            //强制改成对应的ITEM_NO
            this.ruleForm.ORDERBODY[this.currentIndex].curtains[this.ruleForm.ORDERBODY[this.currentIndex].curtains.length - 1].ITEM_NO = lbtmlItem.MATERIAL_NO ? lbtmlItem.MATERIAL_NO : '';
            //排序
            this.ruleForm.ORDERBODY[this.currentIndex].curtains.sort((a, b) => {
              if (a.NCT_SORTNO == b.NCT_SORTNO) {
                return a.NCM_SORTNO > b.NCM_SORTNO ? 1 : -1;
              }
              return a.NCT_SORTNO > b.NCT_SORTNO ? 1 : -1;
            });
          }
        } else if (common == "3B" && oneCurtain.BIAN == "4B") {
          //去掉拉边条
          //找到有没有拉边条
          var lbtItem = this.ruleForm.ORDERBODY[index].curtains.filter(item => item.NCM_PID == oneCurtain.NC_MODEL_ID && item.NC_PART_TYPECODE == "LBT");
          //应该只有一个拉边条，但是循环一下，保险
          for (var i = 0; i < lbtItem.length; i++) {
            this.ruleForm.ORDERBODY[index].curtains.splice(this.ruleForm.ORDERBODY[index].curtains.indexOf(lbtItem[i]), 1);
          }
        }
      }
      oneCurtain.BIAN = common;
      //计算明细用量
      this.calculateChildrenDosage(index1);
    },
    //是否可改
    itemCanChange(row, index) {
      var canChange = true;
      if (row.curtain_level == 0) {
        canChange = row.NCT_CHANGE == 1;
      } else {
        var isStandardLT = false;
        if (!this.ruleForm.ORDERBODY[index].isStandard) {
          //非标定帘款的标定帘头的子件可修改
          var fatherCurtain = this.ruleForm.ORDERBODY[index].curtains.filter(item => item.NC_MODEL_ID == row.NCM_PID && item.NC_MODEL_ID != 0);
          if (fatherCurtain.length && fatherCurtain[0].NC_PART_TYPECODE == 'LT' && fatherCurtain[0].NCM_STANDARD != 'N')
            isStandardLT = true;
        }
        canChange = row.NCT_CHANGE == 1 && row.NCM_CHANGE == 1 || isStandardLT;
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
    onCheckChange(checked, row, index) {
      this.currentIndex = index;
      var childrenCurtain = this.ruleForm.ORDERBODY[index].curtains.filter(item => item.NCM_PID == row.NC_MODEL_ID && row.NC_MODEL_ID != 0);
      var fatherCurtain = this.ruleForm.ORDERBODY[index].curtains.filter(item => item.NC_MODEL_ID == row.NCM_PID && item.NC_MODEL_ID != 0);
      if (childrenCurtain.length) {
        //自身作为父节点，勾选或者取消，子节点应该同步
        for (var i = 0; i < childrenCurtain.length; i++) {
          childrenCurtain[i].curtain_choose = checked;
          //往下更新需要联动，往上更新不需要
          this.onCheckChange(checked, childrenCurtain[i], index);
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
          if (fatherCurtain.BIAN_ENABLE > 0 && fatherCurtain.BIAN == "4B") {
            //找到需要显示拉边条的面料
            var lbtmlItem = this.getLBTMLItem();
            if (lbtmlItem.ITEM_NO && lbtmlItem.ITEM_NO == row.ITEM_NO) {
              //先看看当前数据有没有拉边条，有的话应该是全选的时候这一条还没勾选上的时候上一条数据加载的
              var lbtItemNow = this.ruleForm.ORDERBODY[index].curtains.filter(item => item.NCM_PID == row.NCM_PID && item.NC_PART_TYPECODE == "LBT");
              if (lbtItemNow.length) {
                //有的话直接更新
                lbtItemNow[0].ITEM_NO = lbtmlItem.MATERIAL_NO ? lbtmlItem.MATERIAL_NO : '';
              } else {
                //在修改后的数据中找到拉边条数据并push进去
                var lbtItem = this.ruleForm.ORDERBODY[index].curtain_change.filter(item =>
                  item.NCM_PID == row.NCM_PID &&
                  item.NC_PART_TYPECODE == "LBT"
                );
                if (lbtItem.length) {
                  lbtItem = lbtItem[0]; //只取第一个拉边条（按理应该只有一个）
                  lbtItem = this.dealInsertData(lbtItem)
                  this.ruleForm.ORDERBODY[index].curtains.push({ ...lbtItem });
                  //强制改成对应的ITEM_NO
                  this.ruleForm.ORDERBODY[index].curtains[this.ruleForm.ORDERBODY[index].curtains.length - 1].ITEM_NO = lbtmlItem.MATERIAL_NO ? lbtmlItem.MATERIAL_NO : '';
                  //排序
                  this.ruleForm.ORDERBODY[index].curtains.sort((a, b) => {
                    if (a.NCT_SORTNO == b.NCT_SORTNO) {
                      return a.NCM_SORTNO > b.NCM_SORTNO ? 1 : -1;
                    }
                    return a.NCT_SORTNO > b.NCT_SORTNO ? 1 : -1;
                  });
                }
              }
            }
          }
        } else {
          //取消勾选删掉对应的拉边条，并找有没有其他
          //从父节点看是否需要删除
          if (fatherCurtain.BIAN_ENABLE > 0 && fatherCurtain.BIAN == "4B") {
            var lbtItem = this.ruleForm.ORDERBODY[index].curtains.filter(item => item.NCM_PID == row.NCM_PID && item.NC_PART_TYPECODE == "LBT");
            if (lbtItem.length) {
              //找到需要显示拉边条的面料
              var lbtmlItem = this.getLBTMLItem();
              if (lbtmlItem.ITEM_NO) {
                //有的话更新拉边条
                lbtItem[0].ITEM_NO = lbtmlItem.MATERIAL_NO ? lbtmlItem.MATERIAL_NO : '';
              } else {
                //没有的话删除拉边条
                for (var i = 0; i < lbtItem.length; i++) {
                  this.ruleForm.ORDERBODY[index].curtains.splice(this.ruleForm.ORDERBODY[index].curtains.indexOf(lbtItem[i]), 1);
                }
              }
            }
          }
          //子节点取消勾选，如果同级没有其他勾选了，父节点取消勾选
          var brotherCurtain = this.ruleForm.ORDERBODY[index].curtains.filter(item => item.NCM_PID == row.NCM_PID && item.curtain_choose);
          if (brotherCurtain.length == 0)
            fatherCurtain.curtain_choose = checked;
        }
      }
      //帘身取消勾选，同时取消里衬布
      if (row.NC_PART_TYPECODE == 'LS' && !checked) {
        var LCBITEM = this.ruleForm.ORDERBODY[index].curtains.filter(item => item.NC_PART_TYPECODE == "LCB");
        for (var j = 0; j < LCBITEM.length; j++) {
          //假设有多个里衬布的情况
          LCBITEM[j].curtain_choose = checked;
          this.onCheckChange(checked, LCBITEM[j], index);
        }
      }
    },
    //点击显示可替换列表
    exchangeModelOrItem(row, index) {
      this.currentIndex = index;
      if (!row.curtain_choose) return;
      if (row.curtain_level == 0) {
        //整个组件替换
        this.modelCondition = "";
        this.exchangeModelNow = JSON.parse(JSON.stringify(row)); //当前数据
        this.getExchangeModelList();
      } else {
        //子件替换
        this.itemCondition = "";
        this.exchangeItemNow = JSON.parse(JSON.stringify(row)); //当前数据
        this.getExchangeItemList();
      }
    },
    //获得可替换组件列表
    getExchangeModelList() {
      this.exchangeModelList = [];
      GetExchangeModel({
        NC_TEMPLATE_ID: this.exchangeModelNow.NC_TEMPLATE_ID,
        condition: this.modelCondition.toUpperCase()
      }).then((res) => {
        if (res.data.length > 0 || (res.data.length == 1 && res.data[0].NC_MODEL_ID != this.exchangeModelNow.NC_MODEL_ID)) {
          this.exchangeModelList = res.data;
          //默认数据
          this.exchangeModelTemplate = {
            NC_PART_TYPECODE: this.exchangeModelNow.NC_PART_TYPECODE,
            NC_MODEL_ID: this.exchangeModelNow.OLD_NC_MODEL_ID
          }
          for (var i = 0; i < this.exchangeModelList.length; i++) {
            var curtain_list = this.exchangeModelList[i].curtain_model;
            for (var j = 0; j < curtain_list.length; j++) {
              var oneCurtain = curtain_list[j];
              //添加层级数据
              var level = 0;
              var NCM_PID = oneCurtain.NCM_PID;
              while (NCM_PID != 0) {
                var temp = curtain_list.filter(item => item.NC_MODEL_ID == NCM_PID);
                if (temp.length) {
                  NCM_PID = temp[0].NCM_PID;
                  level++;
                }
              }
              this.$set(oneCurtain, "curtain_level", level);
              //勾选
              this.$set(oneCurtain, "curtain_choose", true);
              //单价
              var price = this.getPrice(this.cus_customerType, oneCurtain);
              this.$set(oneCurtain, "PRICE", price);
              //库存
              this.$set(oneCurtain, "curtain_store", "");
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
      var selectModel = model.curtain_model.filter(item => item.NC_MODEL_ID == model.NC_MODEL_ID);
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
          this.ruleForm.ORDERBODY[this.currentIndex].curtains = this.ruleForm.ORDERBODY[this.currentIndex].curtains.filter(item =>
            item.NC_TEMPLATE_ID != this.exchangeModelNow.NC_TEMPLATE_ID);
          this.ruleForm.ORDERBODY[this.currentIndex].curtain_change = this.ruleForm.ORDERBODY[this.currentIndex].curtain_change.filter(item =>
            item.NC_TEMPLATE_ID != this.exchangeModelNow.NC_TEMPLATE_ID);
          //第二步，把当前选中的push进去
          var curtain_temp = this.getOtherCurtainMsgForExchange(model.curtain_model);
          for (var i = 0; i < curtain_temp.length; i++) {
            curtain_temp[i] = this.dealInsertData(curtain_temp[i]);
            var oneCurtain = curtain_temp[i];
            if (oneCurtain.NC_PART_TYPECODE == "LBT") {
              //先看父节点需不需要加载出拉边条
              var fatherCurtain = curtain_temp.filter(item =>
                item.NC_MODEL_ID == oneCurtain.NCM_PID &&
                item.BIAN_ENABLE > 0 &&
                item.NCM_BIAN == "4B"
              );
              if (fatherCurtain.length) {
                //把拉边条push进去
                this.ruleForm.ORDERBODY[this.currentIndex].curtains.push({ ...oneCurtain });
                //找到需要显示拉边条的面料
                var lbtmlItem = this.getLBTMLItem();
                this.ruleForm.ORDERBODY[this.currentIndex].curtains[this.ruleForm.ORDERBODY[this.currentIndex].curtains.length - 1].ITEM_NO = lbtmlItem.MATERIAL_NO ? lbtmlItem.MATERIAL_NO : '';
              }
            } else {
              this.ruleForm.ORDERBODY[this.currentIndex].curtains.push({ ...oneCurtain });
            }
          }
          this.ruleForm.ORDERBODY[this.currentIndex].curtains.sort((a, b) => {
            if (a.NCT_SORTNO == b.NCT_SORTNO) {
              return a.NCM_SORTNO > b.NCM_SORTNO ? 1 : -1;
            }
            return a.NCT_SORTNO > b.NCT_SORTNO ? 1 : -1;
          });
          this.ruleForm.ORDERBODY[this.currentIndex].curtain_change.push(...curtain_temp);
          this.drawerShow = false;
          this.getRemark();
          //获得父节点
          var fatherTemplateCurtain = this.ruleForm.ORDERBODY[this.currentIndex].curtains.filter(item => item.NCM_PID == 0 && item.NC_PART_TYPECODE == this.exchangeModelNow.NC_PART_TYPECODE);
          if (fatherTemplateCurtain.length) {
            fatherTemplateCurtain = fatherTemplateCurtain[0];
            var index = this.ruleForm.ORDERBODY[this.currentIndex].curtains.indexOf(fatherTemplateCurtain);
            if (index != -1) this.calculateChildrenDosage(index);
          }
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
          curtain_width = this.dosageFilter(this.ruleForm.ORDERBODY[this.currentIndex].CURTAIN_WIDTH * oneCurtain.NCM_WIDTH_RATIO);
        }
        this.$set(oneCurtain, "curtain_width", curtain_width);
        //高
        var curtain_height = 0;
        if (oneCurtain.HEIGHT_ENABLE > 0) {
          if (oneCurtain.NC_PART_TYPECODE == 'LT') {
            //计算帘头高 帘头的高 =（成品高-暗槽高度）÷0.1*0.0235-0.11 结果保留两位
            curtain_height = this.dosageFilter((this.ruleForm.ORDERBODY[this.currentIndex].CURTAIN_HEIGHT - this.ruleForm.ORDERBODY[this.currentIndex].ANCAO_HEIGHT) * 10 * 0.0235 - 0.11);
          } else {
            curtain_height = this.dosageFilter(this.ruleForm.ORDERBODY[this.currentIndex].CURTAIN_HEIGHT * oneCurtain.NCM_HEIGHT_RATIO);
          }
        }
        this.$set(oneCurtain, "curtain_height", curtain_height);
        //总数（面积）由于开始左右转角都是0，所以不用按公式
        var dosage = this.dosageFilter(curtain_width * curtain_height);
        if (oneCurtain.NC_PART_TYPECODE == "GBD") dosage = 1; //挂绑带默认为1
        this.$set(oneCurtain, "DOSAGE", dosage);
        if (oneCurtain.NC_PART_TYPECODE == "LS") {
          //改变里衬布的
          var LCBITEM = this.ruleForm.ORDERBODY[this.currentIndex].curtains.filter(item => item.NC_PART_TYPECODE == "LCB");
          for (var j = 0; j < LCBITEM.length; j++) {
            //假设有多个里衬布的情况
            LCBITEM[j].DOSAGE = dosage;
          }
        }
        if (oneCurtain.NC_PART_TYPECODE == "LCB") {
          //如果后添加里衬布，导致里衬布没有用量
          var LSITEM = this.ruleForm.ORDERBODY[this.currentIndex].curtains.filter(item => item.NC_PART_TYPECODE == "LS");
          if (LSITEM.length && LSITEM[0].DOSAGE != undefined) {
            oneCurtain.DOSAGE = LSITEM[0].DOSAGE;
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
    getExchangeItemList() {
      this.exchangeItemList = [];
      GetExchangeModelItem({
        NC_MODEL_ID: this.exchangeItemNow.NC_MODEL_ID,
        condition: this.itemCondition.toUpperCase(),
        page: this.currentPage,
        limit: this.limit,
      }).then((res) => {
        if (res.data.length > 0 || (res.data.length == 1 && res.data[0].ITEM_NO != this.exchangeItemNow.ITEM_NO)) {
          this.exchangeItemList = res.data;
          this.totalNumber = res.count;
          //默认物料(从替换后的找)
          var defaultItem = this.ruleForm.ORDERBODY[this.currentIndex].curtain_change.filter(item => item.NC_MODEL_ID == this.exchangeItemNow.NC_MODEL_ID);
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
        //替换只是更换item,先替换下面这些字段
        var originItem = this.ruleForm.ORDERBODY[this.currentIndex].curtains.filter(item => item.NC_MODEL_ID == this.exchangeItemNow.NC_MODEL_ID);
        if (originItem.length) {
          originItem = originItem[0];
          originItem.ITEM_NO = item.ITEM_NO;
          originItem.ITEM_ID = item.ITEM_NO;
          originItem.UNIT_NAME = item.UNIT_NAME;
          originItem.FIX_GRADE = item.FIX_GRADE;
          originItem.CURTAIN_ITEM_NAME = item.NOTE;
          originItem.MATERIAL_NO = item.MATERIAL_NO;
        }
        //替换拉边条
        //找到需要显示拉边条的面料
        var lbtmlItem = this.getLBTMLItem();
        if (lbtmlItem.ITEM_NO && lbtmlItem.ITEM_NO == originItem.ITEM_NO) {
          //改变拉边条数据
          var lbtItem = this.ruleForm.ORDERBODY[this.currentIndex].curtains.filter(item =>
            item.NCM_PID == originItem.NCM_PID &&
            item.NC_PART_TYPECODE == "LBT"
          );
          if (lbtItem.length) {
            lbtItem[0].ITEM_NO = lbtmlItem.MATERIAL_NO ? lbtmlItem.MATERIAL_NO : '';
          }
        }
        //更新库存
        this.ruleForm.ORDERBODY[this.currentIndex].curtains = this.getStoreData(this.ruleForm.ORDERBODY[this.currentIndex].curtains);
        this.drawerShow2 = false;
        this.getRemark();
        //找到父节点
        var fatherCurtain = this.ruleForm.ORDERBODY[this.currentIndex].curtains.filter(item => item.NC_MODEL_ID == this.exchangeItemNow.NCM_PID);
        if (fatherCurtain.length) {
          fatherCurtain = fatherCurtain[0];
          var index = this.ruleForm.ORDERBODY[this.currentIndex].curtains.indexOf(fatherCurtain);
          if (index != -1) this.calculateChildrenDosage(index);
        }
      }).catch(() => { });
    },
    //获得需要提交的窗帘数据
    getCurtainData() {
      this.newCurtainData = [];
      this.deleteIds = [];
      for (var i = 0; i < this.ruleForm.ORDERBODY.length; i++) {
        var detail = this.ruleForm.ORDERBODY[i];
        for (var j = 0; j < detail.curtains.length; j++) {
          var oneCurtain = detail.curtains[j];
          if (oneCurtain.curtain_choose) {
            oneCurtain.ITEM_ID = oneCurtain.ITEM_NO;
            this.newCurtainData.push(JSON.parse(JSON.stringify(oneCurtain)))
          }
        }
      }
      //被整个替换而删除的配件需要另外判断
      for (var i = 0; i < this.oldCurtainData.length; i++) {
        var oldOneCurtain = this.oldCurtainData[i];
        var hasThis = this.newCurtainData.filter(item => item.ID == oldOneCurtain.ID);
        if (!hasThis.length) {
          if (oldOneCurtain.ID) this.deleteIds.push(oldOneCurtain);
        }
      }
    },
    //数据有效性判断
    beforeChangeData() {
      if (!this.newCurtainData.length) {
        this.$alert("请至少选择一个明细！", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        });
        return false;
      }
      for (var i = 0; i < this.newCurtainData.length; i++) {
        var oneCurtain = this.newCurtainData[i];
        //编码
        if (!oneCurtain.ITEM_NO) {
          this.$alert(`第${oneCurtain.LINE_NO}幅窗帘${this.transPartTypeCode(oneCurtain.NC_PART_TYPECODE)}没有对应的编码，请检查！`, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return false;
        }
        //宽高
        if (oneCurtain.WIDTH_ENABLE == 2 && (!oneCurtain.WIDTH || Number(oneCurtain.WIDTH) == 0)) {
          this.$alert(`请填写第${oneCurtain.LINE_NO}幅窗帘${this.transPartTypeCode(oneCurtain.NC_PART_TYPECODE)}【宽】`, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return false;
        }
        if (oneCurtain.HEIGHT_ENABLE == 2 && (!oneCurtain.HEIGHT || Number(oneCurtain.HEIGHT) == 0)) {
          this.$alert(`请填写第${oneCurtain.LINE_NO}幅窗帘${this.transPartTypeCode(oneCurtain.NC_PART_TYPECODE)}【高】`, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return false;
        }
        if (Number(oneCurtain.HEIGHT) < 0) {
          this.$alert(`第${oneCurtain.LINE_NO}幅窗帘${this.transPartTypeCode(oneCurtain.NC_PART_TYPECODE)}【高】不能小于0`, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return false;
        }
        //么术贴
        if (oneCurtain.TIE_ENABLE == 2 && !oneCurtain.MESUTIE) {
          this.$alert(`请选择第${oneCurtain.LINE_NO}幅窗帘${this.transPartTypeCode(oneCurtain.NC_PART_TYPECODE)}【么术贴】`, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return false;
        }
        //打开方式
        if (oneCurtain.KAIKOU_ENABLE == 2 && !oneCurtain.KAIKOU) {
          this.$alert(`请选择第${oneCurtain.LINE_NO}幅窗帘${this.transPartTypeCode(oneCurtain.NC_PART_TYPECODE)}【打开方式】`, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return false;
        }
        //工艺方式
        if (oneCurtain.OPERATION_ENABLE == 2 && !oneCurtain.OPERATION) {
          this.$alert(`请选择第${oneCurtain.LINE_NO}幅窗帘${this.transPartTypeCode(oneCurtain.NC_PART_TYPECODE)}【工艺方式】`, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return false;
        }
        //包边方式
        if (oneCurtain.BIAN_ENABLE == 2 && !oneCurtain.BIAN) {
          this.$alert(`请选择第${oneCurtain.LINE_NO}幅窗帘${this.transPartTypeCode(oneCurtain.NC_PART_TYPECODE)}【包边方式】`, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          return false;
        }
      }
      return true
    },
    //数据修改对比
    contrastData() {
      let _data = JSON.parse(JSON.stringify(this.newCurtainData)); //修改后数据
      let _old_data = JSON.parse(JSON.stringify(this.oldCurtainData)); //原始数据
      //把不需要比对的数据拿出来,处理输入的数字数据
      _data.forEach((item) => {
        item.curtain_store = "";
        item.WIDTH = Number(item.WIDTH);
        item.HEIGHT = Number(item.HEIGHT);
        item.LEFT_FILLET = Number(item.LEFT_FILLET);
        item.RIGHT_FILLET = Number(item.RIGHT_FILLET);
        item.FU_QTY = Number(item.FU_QTY);
        item.ZE_QTY = Number(item.ZE_QTY);
        item.DOSAGE = Number(item.DOSAGE);
      });
      _old_data.forEach((item) => {
        item.curtain_store = "";
        item.WIDTH = Number(item.WIDTH);
        item.HEIGHT = Number(item.HEIGHT);
        item.LEFT_FILLET = Number(item.LEFT_FILLET);
        item.RIGHT_FILLET = Number(item.RIGHT_FILLET);
        item.FU_QTY = Number(item.FU_QTY);
        item.ZE_QTY = Number(item.ZE_QTY);
        item.DOSAGE = Number(item.DOSAGE);
      });
      return JSON.stringify(_data) == JSON.stringify(_old_data);
    },
    //兰居修改
    LanjuChange() {
      this.getCurtainData();
      if (!this.beforeChangeData()) return;
      var msg = "确认修改吗？";
      if (this.contrastData()) {
        msg = "所有窗帘未修改，依然修改吗？";
      }
      this.$confirm(msg, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        newCurtainUpdateCurtainOrder({
          cid: Cookies.get("cid"),
          curtainStatusId: "2",
          orderHead: this.ruleFormPost,
          orderDetails: this.orderDetailsPost,
          allCurtains: this.newCurtainData,
          deleteIds: this.deleteIds
        }).then(res => {
          this.$alert("操作成功,已将该订单退回给客户进行确认", "提示", {
            confirmButtonText: "确定",
            type: "success",
          });
          this.closeToTab({
            oldUrl: "order/newCurtainExamineDetail",
            newUrl: "order/newCurtainExamine",
          });
        })
      })
        .catch(() => {
          this.$alert("操作失败:" + res.msg, "提示", {
            confirmButtonText: "确定",
            type: "warning",
          });
          console.log(res);
        });
    },
    backCustomer() {
      this.getCurtainData();
      if (!this.beforeChangeData()) return;
      var msg = "确认退回吗？";
      if (!this.contrastData()) {
        msg = "有窗帘已经修改了，依然确认退回吗？";
      }
      this.$confirm(msg, "提示", {
        confirmButtonText: "确定",
        type: "warning",
      })
        .then(() => {
          newCurtainUpdateCurtainOrder({
            cid: Cookies.get("cid"),
            curtainStatusId: "1",
            orderHead: this.ruleFormPost,
            orderDetails: this.orderDetailsPost,
            allCurtains: this.newCurtainData,
            deleteIds: []
          }).then((res) => {
            this.$alert("操作成功,已将该订单退回给客户进行修改", "提示", {
              confirmButtonText: "确定",
              type: "success",
            });
            this.closeToTab({
              oldUrl: "order/newCurtainExamineDetail",
              newUrl: "order/newCurtainExamine",
            });
          })
            .catch((res) => {
              this.$alert("操作失败:" + res.msg, "提示", {
                confirmButtonText: "确定",
                type: "warning",
              });
              console.log(res);
            });
        })
        .catch(() => { });
    },
    passExamine() {
      this.getCurtainData();
      if (!this.beforeChangeData()) return;
      var msg = "确认通过吗？";
      if (!this.contrastData()) {
        msg = "有窗帘已经修改了，依然确认通过吗？";
      }
      this.$confirm(msg, "提示", {
        confirmButtonText: "确定",
        type: "warning",
      })
        .then(() => {
          newCurtainUpdateCurtainOrder({
            cid: Cookies.get("cid"),
            curtainStatusId: "4",
            orderHead: this.ruleFormPost,
            orderDetails: this.orderDetailsPost,
            allCurtains: this.newCurtainData,
            deleteIds: []
          }).then((res) => {
            this.$alert("操作成功,该订单已通过审核", "提示", {
              confirmButtonText: "确定",
              type: "success",
            });
            this.closeToTab({
              oldUrl: "order/newCurtainExamineDetail",
              newUrl: "order/newCurtainExamine",
            });
          })
            .catch((res) => {
              this.$alert("操作失败:" + res.msg, "提示", {
                confirmButtonText: "确定",
                type: "warning",
              });
              console.log(res);
            });
        })
        .catch(() => { });
    },
    //获得窗帘的说明
    getRemark(index) {
      var curtains = [];
      var orderDetail = this.ruleForm.ORDERBODY[this.currentIndex];
      var allCurtains = orderDetail.curtains;
      if (index == undefined) {
        curtains = allCurtains;
      } else {
        curtains.push(allCurtains[index]);
      }
      for (var i = 0; i < curtains.length; i++) {
        var oneCurtain = curtains[i];
        if (!oneCurtain.ITEM_NO) continue;
        //最小下单量。帘头1.帘身里衬，窗纱4
        if (oneCurtain.NC_PART_TYPECODE == 'LT') {
          if (oneCurtain.DOSAGE < 1 && oneCurtain.DOSAGE > 0) {
            if (oneCurtain.ILLUSTRATE.indexOf('不足1平方米。按1平方米下单量收费;') == -1) {
              oneCurtain.ILLUSTRATE += '不足1平方米。按1平方米下单量收费;';
            }
          } else {
            oneCurtain.ILLUSTRATE = oneCurtain.ILLUSTRATE.replace('不足1平方米。按1平方米下单量收费;', '');
          }
        } else if (oneCurtain.NC_PART_TYPECODE == 'LS' || oneCurtain.NC_PART_TYPECODE == 'LCB' || oneCurtain.NC_PART_TYPECODE == 'CS') {
          if (oneCurtain.DOSAGE < 4 && oneCurtain.DOSAGE > 0) {
            if (oneCurtain.ILLUSTRATE.indexOf('不足4平方米。按4平方米下单量收费;') == -1) {
              oneCurtain.ILLUSTRATE += '不足4平方米。按4平方米下单量收费;';
            }
          } else {
            oneCurtain.ILLUSTRATE = oneCurtain.ILLUSTRATE.replace('不足4平方米。按4平方米下单量收费;', '');
          }
          if (orderDetail.FIX_TYPE == '02') {
            var height = this.convertNumber(oneCurtain.HEIGHT);
            var childrenCurtain = allCurtains.filter(item =>
              item.NCM_PID == oneCurtain.NC_MODEL_ID
              && ((oneCurtain.NC_PART_TYPECODE == 'LS' && (item.NC_PART_TYPECODE == 'ZB' || item.NC_PART_TYPECODE == 'PB1' || item.NC_PART_TYPECODE == 'PB2'))
                || (oneCurtain.NC_PART_TYPECODE == 'CS' && (item.NC_PART_TYPECODE == 'ZB' || item.NC_PART_TYPECODE == 'PB')))
            );
            for (var j = 0; j < childrenCurtain.length; j++) {
              var oneChildren = childrenCurtain[j];
              if (height > 2.8) {
                if (oneChildren.ILLUSTRATE.indexOf('超高;') == -1) {
                  oneChildren.ILLUSTRATE += '超高;';
                }
              } else {
                oneChildren.ILLUSTRATE = oneChildren.ILLUSTRATE.replace('超高;', '');
              }
            }
            if (oneCurtain.NC_PART_TYPECODE == 'LS') {
              //联动里衬
              var lcbCurtain = allCurtains.filter(item => item.NC_PART_TYPECODE == 'LCB');
              if (lcbCurtain.length) {
                lcbCurtain = lcbCurtain[0];
                var lcbChildrenCurtain = allCurtains.filter(item => item.NCM_PID == lcbCurtain.NC_MODEL_ID && item.NC_PART_TYPECODE == 'ZB');
                if (lcbChildrenCurtain.length) {
                  for (var j = 0; j < lcbChildrenCurtain.length; j++) {
                    var oneChildren = lcbChildrenCurtain[j];
                    if (height > 2.8) {
                      if (oneChildren.ILLUSTRATE.indexOf('超高;') == -1) {
                        oneChildren.ILLUSTRATE += '超高;';
                      }
                    } else {
                      oneChildren.ILLUSTRATE = oneChildren.ILLUSTRATE.replace('超高;', '');
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    headTableRowClassName({ row, rowIndex }) {
      return "green-row";
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
    },
    handleScroll() {
      this.$nextTick(() => {
        let main = document.getElementById("mainBackTop");
        let scrollTop = main.scrollTop;
        if (scrollTop > 180) {
          this.isFixed = true;
        } else {
          this.isFixed = false;
        }
      });
    },
    changeFix() {
      this.isFixed2 = !this.isFixed2;
      window.localStorage.setItem("curtainFixed", this.isFixed2);
    }
  },
  mounted() {
    this.orderNumber = Cookies.get("NEW_ORDER_NO");
    this.getPartTypeData();
    this.getCurtainParams();
    this.getDetail();

    window.addEventListener("scroll", this.handleScroll, true);
  },
  destroyed() {
    window.removeEventListener("scroll", this.handleScroll, true);
  },
}
</script>

<style scoped>
.centerCard {
  margin: 0 auto;
  position: relative;
}
.headSpan {
  font-weight: bold;
  font-size: 18px;
  color: black;
}
.zoomRight {
  font-size: 15px;
  line-height: 30px;
  display: inline-block;
  margin-right: 30px;
  font-weight: bold;
}
.zoomLeft {
  font-size: 15px;
  display: inline-block;
  margin-right: 10px;
}
.timeLeft {
  font-size: 14px;
  line-height: 30px;
  display: inline-block;
}
.timeRight {
  font-size: 14px;
  line-height: 30px;
  display: inline-block;
  margin-right: 20px;
  font-weight: bold;
}
.fixHead {
  position: fixed;
  top: 81px;
  z-index: 100;
  background: white;
  left: 230px;
  right: 32px;
}
.fixed-icon {
  position: absolute;
  right: 10px;
  top: 10px;
  cursor: pointer;
}
.a-link {
  color: #409eff;
  cursor: pointer;
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
  height: calc(100% - 50px);
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
.el-table .green-row {
  background: #8bc34a;
}
.centerCard .el-icon-arrow-right:before {
  content: "";
}
.curtain-list .el-table td,
.curtain-list .el-table th {
  padding: 1px 0 !important;
}
.curtain-list .el-table .cell {
  padding: 0 2px !important;
  overflow: inherit !important;
}
.curtain-list .el-input__inner {
  padding: 0 5px !important;
  height: 20px !important;
}
.curtain-list .el-textarea__inner {
  padding: 0 5px !important;
}
.curtain-list .el-table .bold-row,
.model-exchange-inner .el-table .bold-row {
  font-weight: bold;
}
.curtain-list .el-table .fade-row,
.model-exchange-inner .el-table .fade-row {
  color: #b0b4bb;
}
.curtain-list .el-table .delete-row-cls {
  color: tomato !important;
  text-decoration: line-through;
  cursor: unset;
}
.index-badge .el-badge__content {
  background: gray;
}
</style>
