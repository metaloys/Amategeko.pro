import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function importQuestions() {
  const filePath = path.join(__dirname, '../data/questions.json')
  const raw = fs.readFileSync(filePath, 'utf-8')
  const questions = JSON.parse(raw)

  console.log(`Importing ${questions.length} questions...`)

  const { data, error } = await supabase
    .from('questions')
    .upsert(questions, { onConflict: 'source_question_number' })
    .select('id')

  if (error) {
    console.error('Import failed:', error)
    process.exit(1)
  }

  console.log(`✅ Imported ${data?.length} questions successfully`)
}

importQuestions()
