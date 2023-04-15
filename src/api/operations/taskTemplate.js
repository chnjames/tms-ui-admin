import request from '@/utils/request'

/**
 * 任务模板
 */

// 获得模版分页
export function getTaskTemplatePage(query) {
  return request({
    url: '/operations/template/page',
    method: 'get',
    params: query
  })
}
// 创建模版
export function createTaskTemplate(data) {
  return request({
    url: '/operations/template/create',
    method: 'post',
    data: data
  })
}
// 删除模版
export function deleteTaskTemplate(id) {
  return request({
    url: '/operations/template/delete?id=' + id,
    method: 'delete'
  })
}

// 获得模版
export function getTaskTemplate(id) {
  return request({
    url: '/operations/template/get?id=' + id,
    method: 'get'
  })
}

// 上传模板图片
export function uploadTaskTemplateImage(data) {
  return request({
    url: '/operations/template/image/upload',
    method: 'post',
    data: data
  })
}

// 更新模版
export function updateTaskTemplate(data) {
  return request({
    url: '/operations/template/update',
    method: 'put',
    data: data
  })
}

