import request from '@/utils/request'

// 获得品牌列表
export function getBrandList(query) {
  return request({
    url: '/warehouse/material/brand-list',
    method: 'get',
    params: query
  })
}

// 获得类别列表
export function getCategoryList(query) {
  return request({
    url: '/warehouse/material/category-list',
    method: 'get',
    params: query
  })
}

// 获得规格列表
export function getSpecList(query) {
  return request({
    url: '/warehouse/material/specs-list',
    method: 'get',
    params: query
  })
}

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
export function deleteMaterial(query) {
  return request({
    url: '/warehouse/material/delete',
    method: 'delete',
    params: query
  })
}

// 获得物料基础数据
export function getMaterial(query) {
  return request({
    url: '/warehouse/material/get',
    method: 'get',
    params: query
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

// 查询匹配物料列表
export function getMatchMaterialList(query) {
  return request({
    url: '/warehouse/material/list',
    method: 'get',
    params: query
  })
}
/**
 * 物料需求
 */
// 删除物料需求
export function deleteDemand(id) {
  return request({
    url: '/warehouse/material-demand/delete?id=' + id,
    method: 'delete'
  })
}
// 获得物料需求分页
export function getDemandPage(query) {
  return request({
    url: '/warehouse/material-demand/page',
    method: 'get',
    params: query
  })
}
// 物料基础数据模板下载
export function downloadMaterialTemplate() {
  return request({
    url: '/warehouse/material/import-excel-template',
    method: 'get',
    responseType: 'blob',
    header: {
      headers: { 'Content-Type': 'application/x-download' }
    }
  })
}
// 物料基础数据批量导入excel
export function importMaterialExcel(data) {
  return request({
    url: '/warehouse/material/import-excel',
    method: 'post',
    data
  })
}
