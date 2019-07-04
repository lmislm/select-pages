<!-- Index -->
<template>
  <div class="index">
    输入需要选择的图片ID:<input type="text" placeholder="输入格式如：2,4-5" v-model="pageId">
    <SelectPages :pages="mockData.data" :pagesId.sync="pageId"></SelectPages>
  </div>
</template>

<script>
import SelectPages from '../components/SelectPages.vue'
import Mock from 'mockjs'

export default {
  name: 'Index',
  components: { SelectPages },
  data () {
    return {
      mockData: [],
      pageId: ''
    }
  },
  watch: {
    pageId (newVal) {
      this.pageId = this.cnToEnComma(newVal)
    }
  },
  methods: {
    init () {
      // mock数据
      let Random = Mock.Random
      this.mockData = Mock.mock({
        'data|31': [{
          'id|+1': 1,
          'image': Random.dataImage('120x180', 'lmislm')
        }]
      })
    },    
    /**
     * 中文逗号转为英文逗号
     */
    cnToEnComma (inputStr) {
      return inputStr.replace(/，/ig, ',')
    },
  },
  created () {
    this.init()
  }
}

</script>
<style lang='less' scoped>
.index {
  text-align: center;
}
</style>
