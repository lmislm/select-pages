<!-- SelectPages -->
<template>
  <div class="select-pages">
    <div
    v-for="(page, index) in dataPages"
    :key="index"
    @click="onSelectMutiple(page)"
    class="page-content">
      <div
      :class="classPagesMutipleSelected(page.id)"
      @click.shift.exact="shiftClickSelect(page)">
        <div class="page-image">
          <!-- A奇数：长度大于宽度；A偶数：宽度大于长度 -->
          <!-- <img class="img" :class="[isAOddImg(page.image) ? 'odd' : 'even']" :src="page.image" alt=""> -->
          <img class="image" :src="page.image" alt="">
        </div>
      </div>
      <div class="page-id">{{page.id}}</div>
    </div>
  </div>
</template>

<script>
import { range, debounce, differenceBy } from 'lodash'
export default {
  name: 'SelectPages',
  props: {
    pagesId: [String, Number],
    pages: {
      type: Array,
      default: () => []
    },
    selectedPages: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      multipleSelected: [],
      rootClass: 'page-item',
      lastCanceledItem: '',
      shiftStartItem: '',
      isShiftCancel: false,
      lastSelectedItem: '',
      removeSelectedFlag: false
    }
  },
  watch: {
    pagesId: debounce(function (newVal) {
      let numsArr = this.pagesNumberArray(newVal)
      let existObj = this.existInArrayObj(this.pages, 'id', numsArr)
      if (existObj && existObj.length > 0) {
        this.multipleSelected = existObj
      } else {
        this.resetMultipleSelection()
      }
      this.handleInputEmit(this.multipleSelected)
    }, 300)
  },
  computed: {
    dataPages: function () {
      return this.pages || []
    }
  },
  methods: {
    shiftClickSelect (shiftEndItem) {
      // 记录当前值，批量取消选中的时候需要用
      // todo:该方法和onSelectMutiple基本一致，但有区别，考虑多态
      if (this.shiftStartItem && this.shiftStartItem['id'] && shiftEndItem && shiftEndItem['id']) {
        // isShiftCancel决定批量选中或批量取消选中
        // 开始值加1表示不把开始处和结尾处的值记入快捷键范围,即：开区间（start, end）
        let shiftRangeNumsArray = range(Number(this.shiftStartItem.id), Number(shiftEndItem.id))
        // 对数字排个序以便后面，同步输入框的范围值
        let curShiftObj = this.existInArrayObj(this.pages, 'id', shiftRangeNumsArray)
        if (!this.isShiftCancel) {
          // 会有重复值，重复进行选中取消curShiftObj必有undefined
          if (curShiftObj) {
            this.multipleSelected = this.multipleSelected.concat(curShiftObj)
          }
        } else {
          // 取消指定范围内的选中值
          this.removeSelectedInArray(this.multipleSelected, curShiftObj, 'id', true)
        }
        this.handleClickEmit(this.multipleSelected)
      }
    },
    onSelectMutiple (objPage) {
      if (!this.isExistInArray(this.multipleSelected, 'id', objPage['id'])) {
        this.multipleSelected.push(objPage)
        // 记录选中值中的最后一个值,作为shift键的开始值
        this.isShiftCancel = false
        this.shiftStartItem = this.multipleSelected[this.multipleSelected.length - 1]
      } else {
        this.removeMutipleSelected(objPage['id'], true)
        // 记录最后一次点击的取消值，作为shift键的开始值
        this.isShiftCancel = true
        this.shiftStartItem = objPage
      }
      this.handleClickEmit(this.multipleSelected)
    },
    /**
     * 组件通信，$emit.[update:pagesId, onSelectMultiple]
     * 点击时选中的事件分发
     */
    handleClickEmit (selectedArray) {
      let uniqueArray = Array.from(new Set(selectedArray))
      this.$emit('update:pagesId', this.pagesSelectToNumber(uniqueArray) || '')
      this.$emit('onSelectMultiple', uniqueArray)
    },
    /**
     * 外部pageId输入时，传入的值
     * onSelectedId：被格式化了的数字连接，如1-4,8
     * onSelectMultiple：被选中的图片的相关信息[{}]
     */
    handleInputEmit (selectedArray) {
      let uniqueArray = Array.from(new Set(selectedArray))
      this.$emit('onSelectedId', this.pagesSelectToNumber(uniqueArray) || '')
      this.$emit('onSelectMultiple', uniqueArray)
    },
    removeSelectedInArray (source, removeObj, key, canEmit) {
      if (removeObj && removeObj.length > 0) {
        this.multipleSelected = differenceBy(source, removeObj, key)
        if (!canEmit) {
          this.$emit('onSelectMultiple', this.multipleSelected)
        }
      }
    },
    removeMutipleSelected (id, canEmit) {
      this.multipleSelected = this.multipleSelected.filter(item => {
        return id !== item.id
      })
      if (!canEmit) {
        this.$emit('onSelectMultiple', this.multipleSelected)
      }
    },
    classPagesMutipleSelected (id) {
      const baseClass = `${this.rootClass}__selected`
      const baseMultipleClass = `${this.rootClass}`
      if (this.isExistInArray(this.multipleSelected, 'id', id)) {
        return `${baseClass} ${baseMultipleClass}`
      }
      return `${baseMultipleClass}`
    },
    isExistInArray (target, key, value) {
      if (!target) return
      return target.find(item => {
        return String(value) === String(item[key])
      })
    },
    /**
     * 返回指定匹配的多个key的集合
     */
    existInArrayObj (target, key, valueArray) {
      if (valueArray && valueArray.length > 0) {
        return target.filter(item => {
          return valueArray.find(i => String(item[key]) === String(i))
        })
      }
    },
    /**
     * 点击时将已经选中的id格式化,相邻数字简化,已sorted排序
     */
    pagesSelectToNumber (v) {
      let selectedIds = v.map(i => i['id'])
      let sortedNum = selectedIds.sort((a, b) => a - b)
      return this.findConsecutiveNum(sortedNum)
    },
    pagesNumberArray (v) {
      if (!v) return
      let splitArr = String(v).split(',')
      let totalNumSet = []
      splitArr.forEach(item => {
        // singleNumber
        if (this.isUINT(item)) {
          totalNumSet.push(Number(item))
        } else {
          // “-”连接的数字范围，如：4-10
          let g = String(item).split('-')
          // 判断长度等于2，且左右为纯数字符号，且左边数字小于右边
          if (g && g.length === 2 && this.isUINT(g[0]) && this.isUINT(g[1])) {
            let lNum = Number(g[0])
            let rNum = Number(g[1])
            if (lNum < rNum) {
              let nums = range(lNum, rNum + 1)
              totalNumSet = totalNumSet.concat(nums)
            }
          }
        }
      })
      return Array.from(new Set(totalNumSet))
    },
    /**
     * 拼接数字范围简化值
     */
    findConsecutiveNum (sortedArr) {
      let arr = sortedArr.map(i => Number(i))
      // 必须是有序数组
      let start = arr[0] || ''
      let stop = start
      let arrLength = arr.length
      let resultStr = ''

      for (let i = 1; i < arrLength; i++) {
        // 等于前一个连续的值+1，即：连续值
        if (arr[i] === stop + 1) {
          // 指向下一个元素
          stop = arr[i]
        } else {
          if (start === stop) {
            resultStr += start + ','
          } else {
            resultStr += start + '-' + stop + ','
          }
          // 重新初始化start和stop指向
          start = arr[i]
          stop = start
        }
      }
      // 处理最后的数
      if (start === stop) {
        resultStr += start
      } else {
        resultStr += start + '-' + stop
      }
      return resultStr
    },
    /**
     * 判断无符号正整数
     */
    isUINT (n) {
      return /^\d+$/.test(n)
    },
    /**
     * 清空选中值
     */
    resetMultipleSelection () {
      this.multipleSelected = []
    },
    /**
     * 获取base64图片的长宽
     */
    getPngDimensions (base64) {
      const header = atob(base64.slice(0, 50)).slice(16, 24)
      const uint8 = Uint8Array.from(header, c => c.charCodeAt(0))
      const dataView = new DataView(uint8.buffer)
      return {
        width: dataView.getInt32(0),
        height: dataView.getInt32(4)
      }
    },
    /**
     * AOdd，表示A后面跟奇数，即宽大于长；AEven，表示后面跟偶数，即宽小于长
     */
    isAOddImg (base64) {
      return Number(this.getPngDimensions(base64).width) > Number(this.getPngDimensions(base64).height)
    },
    setInit () {
      this.multipleSelected = [].concat(this.selectedPages)
    }
  },
  mounted () {
    this.setInit()
  },
  created () {}
}

</script>
<style lang='less' scoped>
@image-width: 169px;
@margin-size: 10px;
.select-pages {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-content: flex-start;
  margin: @margin-size;
  .page-content {
    display: block;
    width: @image-width + @margin-size * 2;
    margin-bottom: 1px;
    .page-item {
      display: block;
      width: @image-width;
      height: 220px;
      padding: 20px 10px;
      &:hover {
        background: #E8E8E8;
      }
    }
    .page-image {
      position: relative;
      height: 160px;
      .image {
        width: @image-width;
        height: 220px;
      }
      .img {
        max-height:162px;
      }
      .even {
        width:115px;
      }
      .odd {
        width:162px;
      }
    }
    .page-id {
      position: relative;
      text-align: center;
    }
    .page-item__selected {
      background: #1B95F8;
      &:hover {
        background: #1B95F8;
      }
    }
  }
}
</style>
