import request from '@/utils/request'

// 创建物料基础数据
export function createMaterial(data) {
  return request({
    url: '/warehouse/material/create',
    method: 'post',
    data: data
  })
}

// 更新物料基础数据
export function updateMaterial(data) {
  return request({
    url: '/warehouse/material/update',
    method: 'put',
    data: data
  })
}

// 删除物料基础数据
export function deleteMaterial(id) {
  return request({
    url: '/warehouse/material/delete?id=' + id,
    method: 'delete'
  })
}

// 获得物料基础数据
export function getMaterial(id) {
  return request({
    url: '/warehouse/material/get?id=' + id,
    method: 'get'
  })
}

// 获得物料基础数据分页
export function getMaterialPage(query) {
  return request({
    url: '/warehouse/material/page',
    method: 'get',
    params: query
  })
}

// 导出物料基础数据 Excel
export function exportMaterialExcel(query) {
  return request({
    url: '/warehouse/material/export-excel',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}
