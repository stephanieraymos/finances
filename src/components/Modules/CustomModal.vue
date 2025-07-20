<template>
    <div v-if="isVisible" class="modal-overlay" @click="closeOnOverlayClick">
        <div class="modal-content" @click.stop>
            <header class="modal-header">
                <h3>{{ header }}</h3>
                <button class="close-button" @click="closeModal">×</button>
            </header>
            <div class="modal-body" v-html="body">
            </div>
            <footer class="modal-footer">
                <button
                    v-for="(button, index) in buttons"
                    :key="index"
                    :class="button.class"
                    @click="button.onClick"
                >
                    {{ button.label }}
                </button>
            </footer>
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

defineProps({
    header: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        default: "",
    },
    buttons: {
        type: Array,
        default: () => [],
    },
    isVisible: {
        type: Boolean,
        required: true,
    },
    closeOnOverlay: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits(["close"]);

const closeModal = () => {
    emit("close");
};

const closeOnOverlayClick = () => {
    if (props.closeOnOverlay) {
        closeModal();
    }
};
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    z-index: 1000;
}

.modal-content {
    background: var(--cards);
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    padding-bottom: 10px;
}

.close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
}

.modal-body {
    padding: 10px 0;
    text-align: left; 
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
.modal-footer button {
    background: var(--color-blue);
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}
</style>
