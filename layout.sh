#!/bin/bash

# Function to convert a hyphenated name to PascalCase
convert_to_pascal_case() {
  local name=$1
  echo "$name" | awk -F- '{for(i=1;i<=NF;i++){printf toupper(substr($i,1,1)) tolower(substr($i,2))}}'
}

# Function to generate a basic page component
generate_page_content() {
  local name=$1
  local pascal_case_name=$(convert_to_pascal_case "$name")
  echo "export default function ${pascal_case_name}Page() {"
  echo "  return <div>${pascal_case_name} Page</div>;"
  echo "}"
}

# Function to generate a basic component
generate_component_content() {
  local name=$1
  local pascal_case_name=$(convert_to_pascal_case "$name")
  echo "export default function ${pascal_case_name}() {"
  echo "  return <div>${pascal_case_name} Component</div>;"
  echo "}"
}

# Function to generate a basic constants file
generate_constants_content() {
  local name=$1
  echo "// Constants for $name"
}

# Function to generate a basic hook
generate_hook_content() {
  local name=$1
  local pascal_case_name=$(convert_to_pascal_case "$name")
  echo "export function use${pascal_case_name}() {"
  echo "  // Add ${name} hook logic here"
  echo "  return {};"
  echo "}"
}

# Function to generate a basic utility file
generate_utils_content() {
  local name=$1
  echo "// Utility functions for $name"
  echo "export function ${name}Utility() {"
  echo "  // Add ${name} utility logic here"
  echo "}"
}

# Function to generate a basic schema file
generate_schema_content() {
  local name=$1
  echo "// Drizzle ORM schema for $name"
  echo "import { pgTable, serial, text } from 'drizzle-orm/pg-core';"
  echo ""
  echo "export const ${name} = pgTable('${name}', {"
  echo "  id: serial('id').primaryKey(),"
  echo "  name: text('name'),"
  echo "});"
}

# List of features to generate
features=(
  "users"
  "ebooks"
  "interviews"
  "purchases"
  "subscriptions"
  "activities"
  "notifications"
)

# Base path for features
base_path="app/features"

# Iterate over each feature
for feature in "${features[@]}"; do
  feature_path="${base_path}/${feature}"

  echo "Generating structure for ${feature}..."

  # Create directories
  mkdir -p "${feature_path}/components"
  mkdir -p "${feature_path}/constants"
  mkdir -p "${feature_path}/pages"
  mkdir -p "${feature_path}/hooks"
  mkdir -p "${feature_path}/utils"

  # Generate schema.ts
  generate_schema_content "$feature" > "${feature_path}/schema.ts"

  # Generate page file
  page_name="${feature}-page"
  generate_page_content "$page_name" > "${feature_path}/pages/${page_name}.page.tsx"

  # Generate component file
  component_name="${feature}-component"
  generate_component_content "$component_name" > "${feature_path}/components/${component_name}.tsx"

  # Generate constants file
  generate_constants_content "$feature" > "${feature_path}/constants/${feature}-constants.ts"

  # Generate hook file
  generate_hook_content "$feature" > "${feature_path}/hooks/use-${feature}.ts"

  # Generate utils file
  generate_utils_content "$feature" > "${feature_path}/utils/${feature}-utils.ts"
done

echo "All features have been generated with their folders and files."