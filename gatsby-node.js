const path = require("path")
const { createFilePath, createFileNode } = require(`gatsby-source-filesystem`);

//Use Gatsby createPages API to query data with GraphQL 
//and then map the results to pages.
//This creates a page for each blog post.
exports.createPages = ({ actions, graphql }) => {
    const { createPage } = actions

    const blogPostTemplate = path.resolve(`src/templates/blog-post.js`)

    return new Promise((resolve, reject) => {

        resolve(
          graphql(`
    {
      allMarkdownRemark(
        sort: { order: DESC, fields: [frontmatter___date] }
        limit: 1000
      ) {
        edges {
          node {
              fields{
                  slug
              }
            frontmatter {
              title
            }
          }
        }
      }
    }
  `).then(result => {
                if (result.errors) {
                    console.log(result.errors)
                    return reject(result.errors)
                }

                const blogTemplate = path.resolve('./src/templates/blog-post.js');
                const posts = result.data.allMarkdownRemark.edges
                posts.forEach(({ node }, index) => {
                    createPage({
                        path: node.fields.slug,
                        component: blogTemplate,
                        context: {
                            slug: node.fields.slug,
                            prev: index === 0 ? null : posts[index - 1],
                            next: index === result.length - 1 ? null : posts[index + 1],
                        }, //these fields are available inside every post as props.pageContext 
                           //additional data can be passed via context
                    })
                })
                return
            })
        )
    })
}

//Create slugs for pages
exports.onCreateNode = ({ node, getNode, actions }) => {
    const { createNodeField } = actions
    if (node.internal.type === `MarkdownRemark`) {
        const slug = createFilePath({ node, getNode, basePath: `pages` })
        createNodeField({
            node,
            name: `slug`,
            value: slug,
        })

    }
}