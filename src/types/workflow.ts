export interface WorkflowComponent {
  name: string
  relative_path: string
}

export interface WorkflowCategory {
  name: string
  components: WorkflowComponent[]
}

export interface WorkflowContext {
  categories: WorkflowCategory[]
}
