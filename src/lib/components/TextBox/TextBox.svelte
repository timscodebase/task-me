<script lang="ts">
	type Prop = {
		label: string
		name: string
		value: string
		className: string
	}

	let { label, name, value, className } = $props() as Prop
</script>

<div>
	<label class={className} for={name}>{label}</label>
	<textarea required {name}>
		{value}
	</textarea>
</div>

<style>
</style>
