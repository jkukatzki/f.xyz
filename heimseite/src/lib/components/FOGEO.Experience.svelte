<script lang="ts">
    import { ExperienceSettings, Experience } from "../fogeo/fogeo";
    export let experienceSettings: ExperienceSettings;
    export const experience = new Experience(experienceSettings);
</script>

<canvas id={experienceSettings.renderOptions.elSelector}></canvas>