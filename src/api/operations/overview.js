import request from '@/utils/request'

// 创建项目主表
export function createOverview(data) {
  return request({
    url: '/operations/project/create',
    method: 'post',
    data: data
  })
}

// 更新项目主表
export function updateOverview(data) {
  return request({
    url: '/operations/project/update',
    method: 'put',
    data: data
  })
}

// 删除项目主表
export function deleteOverview(id) {
  return request({
    url: '/operations/project/delete?id=' + id,
    method: 'delete'
  })
}

// 获得项目主表
export function getOverview(id) {
  return request({
    url: '/operations/project/get?id=' + id,
    method: 'get'
  })
}

// 获得项目主表分页
export function getOverviewPage(query) {
  return request({
    url: '/operations/project/page',
    method: 'get',
    params: query
  })
}

// 导出项目主表 Excel
export function exportOverviewExcel(query) {
  return request({
    url: '/operations/project/export-excel',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}
