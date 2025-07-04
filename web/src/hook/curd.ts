import { http } from '@/util/http'
import { ElMessage, ElMessageBox, type Action } from 'element-plus'
import { onMounted, ref, Ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

interface UseCrudResult {
  model: Ref
  table_data: Ref
  query: Ref<CrudQuery>
  total: Ref<number>
  is_new: Ref<boolean>
  show_drawer: Ref<boolean>
  loading: Ref<boolean>
  search: () => Promise<void>
  reset: () => Promise<void>
  fetch_data: () => Promise<void>
  handleCurrentChange: (page: number) => Promise<void>
  handleSizeChange: (size: number) => Promise<void>
  remove: (id: string) => Promise<void>
  edit: (row: Record<string, any>) => Promise<void>
  save: () => Promise<void>
  add: () => void
}

interface CrudQuery {
  limit?: number
  page?: number
  sort?: {
    [key: string]: any
  }
  
  where?: {
    [key: string]: any
  }
  [key: string]: any
}
interface Option {
  initModel?: any,
  where?: {
    [key: string]: any
  }
  limit?: number
  page?: number
  sort?: {
    [key: string]: any
  }
}

/**
 *
 * @param url 接口路径
 * @param initModel 默认参数
 * @param where 默认查询条件
 * @returns
 */
export const useCrud = (
  url,
  option:Option,
  next?: {
    on_save?: Function
  },
): UseCrudResult => {
  //模型
  const model = ref(option.initModel)

  const route = useRoute()
  const router = useRouter()
  //是否新增
  const is_new = ref(true) as any

  //抽屉
  const show_drawer = ref(false)

  const loading = ref(true)
  //table数据
  const table_data = ref([])

  //query条件
  const query = ref<CrudQuery>({
    limit: option.limit || 10,
    page: option.page || 1,
    sort: ref(option.sort),
    where: ref(option.where),
  })

  const reset = async () => {
    query.value.where = {}
    fetch_data()
  }
  //总数
  const total = ref()

  /**
   *
   * @param row 模型数据
   * @returns 修改
   *
   */
  const edit = async (row) => {
    model.value = await http.get(`${url}/${row._id}`)
    is_new.value = false
    show_drawer.value = true
  }

  /**
   *
   * @param id 删除目标id
   * @returns 删除
   */
  const remove = async (id) => {
    ElMessageBox.confirm('确认删除数据吗？', {
      distinguishCancelAndClose: true,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
      .then(async () => {
        // const data = await http.delete(`${url}/${id}`)
        await http.put(`${url}/${id}`,{
          status:0
        })
        // await api.DbData.create({scoure:url,content:JSON.stringify(data)})
        ElMessage({
          type: 'success',
          message: `删除成功`,
        })
        await fetch_data()
      })
      .catch((action: Action) => {})

    // ElMessageBox.alert("确认删除数据吗？", {
    //   confirmButtonText: "确认",
    //   callback: async (action: Action) => {
    //     const data =  await http.delete(`${url}/${id}`);
    //     // await api.DbData.create({scoure:url,content:JSON.stringify(data)})
    //     ElMessage({
    //       type: "success",
    //       message: `删除成功`,
    //     });
    //     await fetch_data();
    //   },
    // });
  }

  const search = async () => {
    //字符串去空格
    // for (let key in query.value.where) {
    //   if (typeof query.value.where[key] == "string") {
    //     query.value.where[key] = query.value.where[key].replace(/\s*/g, "");
    //   }
    //   if (query.value.where[key] == "") {
    //     delete query.value.where[key];
    //   }
    // }
    query.value.page = 1
    fetch_data()
  }
  const add = () => {
    is_new.value = true
    // (model.value = Object.assign({}, initModel));
    // model.value = { ...initModel }

    model.value = Object.assign({}, option.initModel)

    show_drawer.value = true
  }

  //页面数
  const handleSizeChange = async (size) => {
    query.value.limit = size
    await fetch_data()
  }

  //切换页面
  const handleCurrentChange = async (page) => {
    query.value.page = page
    await fetch_data()
  }

  const save = async () => {
    if (is_new.value) {
      await http.post(url, model.value)
      ElMessage({
        type: 'success',
        message: `新增成功`,
      })
      await fetch_data()
      show_drawer.value = false
      model.value = Object.assign({}, option.initModel)
    } else {
      ElMessageBox.confirm('确认修改数据吗？', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      })
        .then(async () => {
          await http.put(`${url}/${model.value._id}`, model.value)
          await fetch_data()
          is_new.value = true
          show_drawer.value = false
          ElMessage({
            type: 'success',
            message: `修改成功`,
          })
          if (next.on_save) {
            next.on_save()
          }
        })
        .catch((action: Action) => {})
    }
  }

  //获取数据
  const fetch_data = async () => {
    loading.value = true
    const res: any = await http.get(url, {
      params: {
        query: query.value,
      },
    })
    total.value = res.total
    table_data.value = res.data
    loading.value = false

  }

  onMounted(() => {
    fetch_data()
  })

  return {
    model,
    table_data,
    query,
    total,
    is_new,
    show_drawer,
    loading,
    search,
    reset,
    fetch_data,
    handleCurrentChange,
    handleSizeChange,
    remove,
    edit,
    save,
    add,
  }
}
