import request from '@/utils/request'

// 创建工厂区域
export function createFactoryArea(data) {
  return request({
    url: '/config/factory-area/create',
    method: 'post',
    data: data
  })
}

// 更新工厂区域
export function updateFactoryArea(data) {
  return request({
    url: '/config/factory-area/update',
    method: 'put',
    data: data
  })
}

// 删除工厂区域
export function deleteFactoryArea(id) {
  return request({
    url: '/config/factory-area/delete?id=' + id,
    method: 'delete'
  })
}

// 获得工厂区域
export function getFactoryArea(id) {
  return request({
    url: '/config/factory-area/get?id=' + id,
    method: 'get'
  })
}

// 获得工厂区域分页
export function getFactoryAreaPage(query) {
  return request({
    url: '/config/factory-area/page',
    method: 'get',
    params: query
  })
}

// 导出工厂区域 Excel
export function exportFactoryAreaExcel(query) {
  return request({
    url: '/config/factory-area/export-excel',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}
// 获取厂区精简信息列表
export function getSimpleFactoryArea(query) {
  return request({
    url: '/config/factory-area/list-all-simple',
    method: 'get',
    params: query
  })
}
