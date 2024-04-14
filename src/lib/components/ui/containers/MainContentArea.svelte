<div class="flex flex-col-reverse  xl:flex-row gap-4 max-w-full w-full h-full py-0">
    
    <div class="flex flex-col gap-4 max-w-full w-full h-full min-w-0">
        <slot/>
    </div>
    
    <div>
        <slot name="right-panel"/>
    </div>

</div>
