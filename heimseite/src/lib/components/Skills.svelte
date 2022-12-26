<script>
  let skills = [
    {
      text: "Typescript",
      iconPath: "/images/logos/typescript.svg",
    },
    {
      text: "Angular",
      iconPath: "/images/logos/angular.svg",
    },
    {
      text: "Svelte",
      iconPath: "/images/logos/svelte.svg",
    },
    {
      text: "Python",
      iconPath: "/images/logos/python.svg"
    },
    {
      text: "Java",
      iconPath: "/images/logos/java.svg",
    },
    {
      text: "Docker",
      iconPath: "/images/logos/docker.svg"
    },
    {
      text: "Blender",
      iconPath: "/images/logos/blender.svg"
    }
  ]
</script>



{#each skills as skill}
  <div class="skill-item">
    <span >
        <img class="skill-icon" alt={skill.text} src={skill.iconPath}>
    </span>
    <span class="skill-text">
        {skill.text}
    </span>
  </div>
{/each}

<style>
  .skill-item {
    position: relative;
    display: inline-block;
    cursor: pointer;
    outline: none;
    border: 0;
    vertical-align: middle;
    text-decoration: none;
    color: #fff;
    border-radius: 25px;
    -webkit-transition: width 2s;
    transition: width 2s;
  }
  .skill-icon {
    width: 2em;
    height: 2em;
  }
  .skill-text {
    height: 100%;
    max-width: 0;
    display: inline-block;
    -webkit-transition: color .25s 1.5s, max-width 1s;
    transition: color .25s 1.5s, max-width 1s;
    vertical-align: middle;
    white-space: nowrap;
    margin-left: 1px;
    overflow: hidden;
    color: white;
    font-family: 'roboto';
    font-weight: bold;
    margin-bottom: 1em;
    margin-right: 0.5em;
  }

  .skill-item:hover .skill-text {
    max-width: 300px;
    color: white;
  }
  
  
</style>