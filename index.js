'use-strict'

const visited = Symbol('visited')

function getImportArgPath(p) {
  return p.parentPath.get('arguments')[0]
}

function trimChunkNameBaseDir(baseDir) {
  return baseDir.replace(/^[./]+|(\.jsx?$)/g, '')
}

function getMagicCommentChunkName(importArgNode) {
  const { quasis, expressions } = importArgNode
  if (!quasis) return trimChunkNameBaseDir(importArgNode.value)

  const baseDir = quasis[0].value.cooked
  const hasExpressions = expressions.length > 0
  const chunkName = baseDir + (hasExpressions ? '[request]' : '')
  return trimChunkNameBaseDir(chunkName)
}

function addLeadComments(argPath) {
  const chunkName = getMagicCommentChunkName(argPath.node)

  delete argPath.node.leadingComments
  argPath.addComment('leading', ` webpackChunkName: '${chunkName}' `)
}

function updateLeadingComment(argPath) {
  const comments = argPath.node.leadingComments

  if (!comments || comments.length === 0) {
    addLeadComments(argPath)
    return
  }

  const commentParts = comments[0].value.split(',')
  const chunkNameComment = commentParts.find(c => c.indexOf('webpackChunkName') >= 0)

  if (!chunkNameComment) {
    const chunkName = getMagicCommentChunkName(argPath.node)
    const newChunkNameComment = ` webpackChunkName: '${chunkName}'`
    commentParts.push(newChunkNameComment)

    comments[0].value = commentParts.join(',')
  }
}

module.exports = function pathChunkNamePlugin({ template }) {
  const importFuncTemplate = template('() => IMPORT')

  return {
    name: 'path-chunk-name',
    visitor: {
      Import(p) {
        if (p[visited]) return
        p[visited] = true

        const argPath = getImportArgPath(p)
        updateLeadingComment(argPath)

        const grandpaPath = p.parentPath.parentPath
        // check whether is thenable call
        const isThenCall = grandpaPath &&
          grandpaPath.type === 'MemberExpression' &&
          grandpaPath.node.property.name === 'then'

        const hasArrowFunctionParent = grandpaPath &&
          grandpaPath.type === 'ArrowFunctionExpression' &&
          grandpaPath.node.body.type === 'CallExpression'

        const isReturnParent = grandpaPath &&
          grandpaPath.type === 'ReturnStatement' &&
          grandpaPath.node.argument.type === 'CallExpression'

        // if need to convert to function, use delay mode

        // convert `import('./Foo')` to `() => import('./Foo')`
        // and is not `import('./Foo').then`
        // and is not `() => import('./Foo')
        if (!isThenCall && !hasArrowFunctionParent
          && !isReturnParent && this.opts.delay) {
          const importFunc = importFuncTemplate({
            IMPORT: argPath.parent
          }).expression

          p.parentPath.replaceWith(importFunc)
        }
      }
    }
  }
}
