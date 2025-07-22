<template>
    <div v-if="isVisible" class="modal-overlay" @click="closeOnOverlayClick">
        <div class="modal-content" @click.stop>
            <header class="modal-header">
                <h3>{{ header }}</h3>
                <button class="cancel-button" @click="closeModal">×</button>
            </header>
            <div class="modal-body" v-html="body">
            </div>
            <footer class="modal-footer">
                <button
                    v-for="(button, index) in computedButtons"
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
import { defineProps, defineEmits, computed } from "vue";

const props = defineProps({
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
    submit: {
        type: Function,
        default: () => {},
    },
});

const emit = defineEmits(["close", "submit"]);

const closeModal = () => {
    emit("close");
};

const closeOnOverlayClick = () => {
    if (props.closeOnOverlay) {
        closeModal();
    }
};

const computedButtons = computed(() => {
    return props.buttons.length
        ? props.buttons
        : [
              { label: "Cancel", class: "cancel-button", onClick: closeModal },
              { label: "OK", class: "ok-button", onClick: () => emit("submit") },
          ];
});
</script>

<style>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 40%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    z-index: 1000;
}

.modal-content {
    background: var(--cards);
    margin: 0 auto;
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

.cancel-button {
    background: var(--cards);
    border: none;
    cursor: pointer;
}
.ok-button {
    background: var(--color-blue);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
}

.modal-body {
    padding: 10px 0;
    text-align: left; 
    display: flex;
    flex-direction: column;

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
form {
    display: flex;
    flex-direction: column;
}
input, textarea{
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    background: var(--cards);
    border: 1px solid var(--shade-5);
}
</style>
