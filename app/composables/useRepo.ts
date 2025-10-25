import type { RepositoryListItem, RepoCommit } from '~/types/api'

type CommitsCache = Record<string, RepoCommit[]>
const keyOf = (r: Pick<RepositoryListItem, 'owner_name' | 'name'>) => `${r.owner_name}/${r.name}`

export const useRepo = () => {
  const { api } = useAuth()

  const selectedRepo = useState<RepositoryListItem | null>('repo_selected', () => null)

  const commitsCache = useState<CommitsCache>('repo_commits_cache', () => ({}))

  const setSelectedRepo = (repo: RepositoryListItem | null) => { selectedRepo.value = repo }

  const getCachedCommits = (repo?: RepositoryListItem | null): RepoCommit[] => {
    const r = repo ?? selectedRepo.value
    if (!r) return []
    return commitsCache.value[keyOf(r)] ?? []
  }

  const fetchRepoCommits = async (
    repo: RepositoryListItem,
    opts: { force?: boolean; params?: Record<string, any> } = {}
  ): Promise<RepoCommit[]> => {
    const k = keyOf(repo)
    if (!opts.force && commitsCache.value[k]?.length) return commitsCache.value[k]

    const res = await api<{ data: RepoCommit[] }>(
      `/projects/${repo.owner_name}/repos/${repo.name}/commits`,
      { query: opts.params ?? {} }
    )
    const commits = (res?.data ?? []).map(c => ({
      ...c,
      created_at: c.created_at ? new Date(c.created_at).toISOString() : undefined,
    }))
    commitsCache.value[k] = commits
    return commits
  }

  const fetchSelectedRepoCommits = async (opts?: { force?: boolean; params?: Record<string, any> }) => {
    if (!selectedRepo.value) return []
    return fetchRepoCommits(selectedRepo.value, opts)
  }

  return {
    selectedRepo,
    setSelectedRepo,
    commitsCache,
    getCachedCommits,
    fetchRepoCommits,
    fetchSelectedRepoCommits,
  }
}
