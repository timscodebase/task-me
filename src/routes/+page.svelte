<script lang="ts">
	import { z } from 'zod'
	import OpenAI from 'openai'
	import party from 'party-js'
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { PromptTemplate } from 'langchain/prompts'

	let { data } = $props()
	let apiKey = data.apiKey

	let form: HTMLFormElement | undefined = undefined
	let formData: FormData | undefined = undefined
	let loading = $state(false)
	let plan = $state('') as string
	let task = $state('') as string

	onMount(() => {
		form = document.querySelector('form') || undefined
		formData = new FormData(form)
		console.log('formData', formData)
	})

	async function submit() {
		loading = true
		plan = ''
		if (formData) {
			task = formData.get('task')
		}

		// const validation = z
		// 	.object({
		// 		task: z.string().min(1).max(60)
		// 	})
		// 	.safeParse(formData)

		// if (!validation.success) {
		// 	request.json(400, {
		// 		errors: validation.error.issues
		// 	})
		// 	return
		// }

		const openai = new OpenAI({
			apiKey,
			dangerouslyAllowBrowser: true
		})

		const template = `Create a project plan for {task}. Include tasks, deliverables, and milestones. Also, include how long it would likely take to reach each milestone.`

		const promptTemplate = new PromptTemplate({
			template: template,
			inputVariables: ['task']
		})

		const prompt = await promptTemplate.format({ task })

		const stream = await openai.chat.completions.create({
			messages: [{ role: 'user', content: prompt }],
			model: 'gpt-3.5-turbo',
			max_tokens: 300,
			stream: true
		})
		for await (const chunk of stream) {
			plan += chunk.choices[0]?.delta?.content || ''
		}

		loading = false
		party.confetti(form)
		goto('/')
	}
</script>

<main class="max-w-4xl mx-auto p-4">
	<h1 class="text-4xl">Task Me</h1>
	<p>An AI Bot to help you get things done</p>

	<form class="grid content-center gap-4 mt-8" on:submit={submit}>
		<div class="flex content-center">
			<label class="grid content-center" for="task">Create a project plan for</label>
			<input
				type="text"
				name="task"
				value={task}
				placeholder="starting a business"
				id="task"
				required
			/>
		</div>

		<div class="flex gap-4">
			<button type="submit" aria-disabled={loading}>
				{#if loading}
					<iconify-icon class="svg" icon="pixelarticons:loader" />
				{:else}
					Tell me
				{/if}
			</button>
		</div>
	</form>

	{#if loading}
		<p>Waiting for response...</p>
	{:else}
		<article class="mt-4 border rounded-lg p-4 bg-[canvas]">
			{@html plan}
		</article>
	{/if}

	<p class="my-10 sm:mt-20 text-center">
		Disclaimer: This app uses AI to generate content, so things may come out a lil' wonky.
	</p>
</main>

<style>
	button {
		display: grid;
		place-items: center;
	}
	.svg {
		font-size: 3rem;
	}

	/* remove default input styles */
	input {
		background-color: transparent;
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		border: none;
		outline: none;
		width: 40ch;
		margin-left: -3px;
	}
</style>
