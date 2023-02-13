import request from '@/utils/request'

// 创建出入库记录
export function createMaterialLog(data) {
  return request({
    url: '/warehouse/material-log/create',
    method: 'post',
    data: data
  })
}

// 更新出入库记录
export function updateMaterialLog(data) {
  return request({
    url: '/warehouse/material-log/update',
    method: 'put',
    data: data
  })
}

// 删除出入库记录
export function deleteMaterialLog(id) {
  return request({
    url: '/warehouse/material-log/delete?id=' + id,
    method: 'delete'
  })
}

// 获得出入库记录
export function getMaterialLog(id) {
  return request({
    url: '/warehouse/material-log/get?id=' + id,
    method: 'get'
  })
}

// 获得出入库记录分页
export function getMaterialLogPage(query) {
  return request({
    url: '/warehouse/material-log/page',
    method: 'get',
    params: query
  })
}

// 导出出入库记录 Excel
export function exportMaterialLogExcel(query) {
  return request({
    url: '/warehouse/material-log/export-excel',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}
