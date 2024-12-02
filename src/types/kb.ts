export interface ComponentMetadata {
  name: string
  category: string
  description: string
}

export interface VariationMetadata {
  name: string
  status: 'stable' | 'experimental'
  created_at: string
  purpose: string
  target_audience: string
}

export interface KBComponent {
  category: string
  name: string
  variation?: string
  current_version: string
  checked_version: string
}

export interface StitchConfig {
  kb: {
    repository: string
  }
  components: KBComponent[]
}
