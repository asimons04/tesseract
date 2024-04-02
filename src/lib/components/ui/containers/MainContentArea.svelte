<div class="flex flex-col-reverse  xl:flex-row gap-4 max-w-full w-full h-full py-4">
    <div class="flex flex-col gap-4 max-w-full w-full h-full min-w-0">
        <slot/>
    </div>

    <div class="lg:mb-[-24px]">
        <slot name="right-panel"/>
    </div>

</div>