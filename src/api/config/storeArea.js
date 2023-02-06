import request from '@/utils/request'

// 创建仓库/库区
export function createStoreArea(data) {
  return request({
    url: '/config/store-area/create',
    method: 'post',
    data: data
  })
}

// 更新仓库/库区
export function updateStoreArea(data) {
  return request({
    url: '/config/store-area/update',
    method: 'put',
    data: data
  })
}

// 删除仓库/库区
export function deleteStoreArea(id) {
  return request({
    url: '/config/store-area/delete?id=' + id,
    method: 'delete'
  })
}

// 获得仓库/库区
export function getStoreArea(id) {
  return request({
    url: '/config/store-area/get?id=' + id,
    method: 'get'
  })
}

// 获得仓库/库区分页
export function getStoreAreaPage(query) {
  return request({
    url: '/config/store-area/page',
    method: 'get',
    params: query
  })
}

// 导出仓库/库区 Excel
export function exportStoreAreaExcel(query) {
  return request({
    url: '/config/store-area/export-excel',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}
// 获取仓库精简信息列表
export function getStoreSimpleList(query) {
  return request({
    url: '/config/store-area/store-list',
    method: 'get',
    params: query
  })
}
