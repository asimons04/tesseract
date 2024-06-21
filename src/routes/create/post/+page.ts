interface LoadParams {
    url: URL
}
export const load = ({ url }:LoadParams) => ({
  crosspost: Boolean(url.searchParams.get('crosspost')) ?? false,
})
