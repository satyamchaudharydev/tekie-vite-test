const slugifyContent = (content) => content ? content.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') : ''

export const slugifyID = (ID) => ID ? ID.toString().trim().toUpperCase().replace(/\w{5}(?=.)/g, '$&-') : ''

export const decodeSlugID = (ID) => ID ? ID.toLowerCase().replace(/-/g, '') : ''

// export const secretSlug = (slug) => [...slug].map(c => c === '-' ? c : c)

export default slugifyContent